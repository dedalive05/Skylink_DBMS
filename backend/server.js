const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('../public'));

app.get('/api/flights', (req, res) => {
  const sql = `
    SELECT 
      f.flight_id,
      f.flight_number,
      f.airline,
      f.departure_time,
      f.arrival_time,
      f.origin_airport,
      f.destination_airport,
      p.dynamic_fare,
      p.demand_factor,
      COUNT(CASE WHEN i.availability_status = 'Available' THEN 1 END) AS available_seats
    FROM flight f
    JOIN pricing p ON f.flight_id = p.flight_id
    JOIN inventory i ON f.flight_id = i.flight_id
    GROUP BY 
      f.flight_id,
      f.flight_number,
      f.airline,
      f.departure_time,
      f.arrival_time,
      f.origin_airport,
      f.destination_airport,
      p.dynamic_fare,
      p.demand_factor
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    res.json(result);
  });
});
app.get('/api/test-insert', (req, res) => {
  const sql = `
    INSERT INTO reservation (user_id, flight_id, booking_time, status, total_amount)
    VALUES (1, 1, NOW(), 'Confirmed', 5500)
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({
      message: 'Reservation inserted',
      reservation_id: result.insertId
    });
  });
});
app.get('/api/flights/search', (req, res) => {
  const { from, to } = req.query;

  const sql = `
    SELECT 
      f.flight_id,
      f.flight_number,
      f.airline,
      f.departure_time,
      f.arrival_time,
      f.origin_airport,
      f.destination_airport,
      p.dynamic_fare,
      p.demand_factor,
      COUNT(CASE WHEN i.availability_status = 'Available' THEN 1 END) AS available_seats
    FROM flight f
    JOIN pricing p ON f.flight_id = p.flight_id
    JOIN inventory i ON f.flight_id = i.flight_id
    WHERE f.origin_airport LIKE ? AND f.destination_airport LIKE ?
    GROUP BY 
      f.flight_id,
      f.flight_number,
      f.airline,
      f.departure_time,
      f.arrival_time,
      f.origin_airport,
      f.destination_airport,
      p.dynamic_fare,
      p.demand_factor
  `;

  db.query(sql, [`%${from}%`, `%${to}%`], (err, result) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    res.json(result);
  });
});

app.post('/api/book', (req, res) => {
    console.log("BOOKING RECEIVED:", req.body);
  const {
    user_name,
    email,
    phone,
    flight_number,
    passenger_name,
    age,
    gender,
    document_number,
    seat_number,
    payment_method,
    amount
  } = req.body;

  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    const userSql = `
      INSERT INTO user (name, email, phone, password, role)
      VALUES (?, ?, ?, '12345', 'Customer')
      ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone)
    `;

    db.query(userSql, [user_name, email, phone], (err) => {
      if (err) {
        return db.rollback(() => res.status(500).json({ message: err.message }));
      }

      db.query('SELECT user_id FROM user WHERE email = ?', [email], (err, userResult) => {
        if (err) {
          return db.rollback(() => res.status(500).json({ message: err.message }));
        }

        const userId = userResult[0].user_id;

        const loyaltySql = `
          INSERT INTO loyalty_account (user_id, points_balance, tier_level)
          VALUES (?, 0, 'Silver')
          ON DUPLICATE KEY UPDATE user_id = user_id
        `;

        db.query(loyaltySql, [userId], (err) => {
          if (err) {
            return db.rollback(() => res.status(500).json({ message: err.message }));
          }

          db.query('SELECT flight_id FROM flight WHERE flight_number = ?', [flight_number], (err, flightResult) => {
            if (err || flightResult.length === 0) {
              return db.rollback(() => res.status(400).json({ message: 'Flight not found' }));
            }

            const flightId = flightResult[0].flight_id;

            const seatSql = `
              SELECT s.seat_id
              FROM seat s
              JOIN inventory i ON s.seat_id = i.seat_id
              WHERE s.seat_number = ?
              AND i.flight_id = ?
              AND i.availability_status = 'Available'
              LIMIT 1
            `;

            db.query(seatSql, [seat_number, flightId], (err, seatResult) => {
              if (err) {
                return db.rollback(() => res.status(500).json({ message: err.message }));
              }

              if (seatResult.length === 0) {
                return db.rollback(() => res.status(400).json({ message: 'Seat already booked or not available' }));
              }

              const seatId = seatResult[0].seat_id;

              const reservationSql = `
                INSERT INTO reservation (user_id, flight_id, booking_time, status, total_amount)
                VALUES (?, ?, NOW(), 'Confirmed', ?)
              `;

              db.query(reservationSql, [userId, flightId, amount], (err, reservationResult) => {
                if (err) {
                  return db.rollback(() => res.status(500).json({ message: err.message }));
                }

                const reservationId = reservationResult.insertId;

                const passengerSql = `
                  INSERT INTO passenger (reservation_id, name, age, gender, document_number)
                  VALUES (?, ?, ?, ?, ?)
                `;

                db.query(passengerSql, [reservationId, passenger_name, age, gender, document_number], (err) => {
                  if (err) {
                    return db.rollback(() => res.status(500).json({ message: err.message }));
                  }

                  const paymentSql = `
                    INSERT INTO payment (reservation_id, payment_method, amount, payment_status, transaction_time)
                    VALUES (?, ?, ?, 'Completed', NOW())
                  `;

                  db.query(paymentSql, [reservationId, payment_method, amount], (err) => {
                    if (err) {
                      return db.rollback(() => res.status(500).json({ message: err.message }));
                    }

                    const pnr = 'PNR' + Math.floor(10000 + Math.random() * 90000);

                    const ticketSql = `
                      INSERT INTO ticket (reservation_id, pnr, issue_date, ticket_status)
                      VALUES (?, ?, NOW(), 'Issued')
                    `;

                    db.query(ticketSql, [reservationId, pnr], (err, ticketResult) => {
                      if (err) {
                        return db.rollback(() => res.status(500).json({ message: err.message }));
                      }

                      const ticketId = ticketResult.insertId;

                      const assignmentSql = `
                        INSERT INTO seat_assignment (ticket_id, seat_id, assignment_status)
                        VALUES (?, ?, 'Assigned')
                      `;

                      db.query(assignmentSql, [ticketId, seatId], (err) => {
                        if (err) {
                          return db.rollback(() => res.status(500).json({ message: err.message }));
                        }

                        const inventorySql = `
                          UPDATE inventory
                          SET availability_status = 'Booked'
                          WHERE flight_id = ? AND seat_id = ?
                        `;

                        db.query(inventorySql, [flightId, seatId], (err) => {
                          if (err) {
                            return db.rollback(() => res.status(500).json({ message: err.message }));
                          }

                          const loyaltyUpdateSql = `
                            UPDATE loyalty_account
                            SET points_balance = points_balance + 100
                            WHERE user_id = ?
                          `;

                          db.query(loyaltyUpdateSql, [userId], (err) => {
                            if (err) {
                              return db.rollback(() => res.status(500).json({ message: err.message }));
                            }

                            const notificationSql = `
                              INSERT INTO notification (user_id, type, message, sent_time)
                              VALUES (?, 'Email', ?, NOW())
                            `;

                            db.query(notificationSql, [userId, `Booking confirmed. Your PNR is ${pnr}`], (err) => {
                              if (err) {
                                return db.rollback(() => res.status(500).json({ message: err.message }));
                              }

                              db.commit((err) => {
                                if (err) {
                                  return db.rollback(() => res.status(500).json({ message: err.message }));
                                }

                                res.json({
                                  message: 'Booking successful',
                                  reservation_id: reservationId,
                                  ticket_id: ticketId,
                                  pnr: pnr
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

app.get('/api/admin/stats', (req, res) => {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM reservation) AS total_reservations,
      (SELECT IFNULL(SUM(amount), 0) FROM payment WHERE payment_status = 'Completed') AS total_revenue,
      (SELECT COUNT(*) FROM flight) AS total_flights,
      (SELECT COUNT(*) FROM inventory WHERE availability_status = 'Available') AS available_seats
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    res.json(result[0]);
  });
});

app.listen(5000, () => {
  console.log('SkyLink backend running on http://localhost:5000');
});