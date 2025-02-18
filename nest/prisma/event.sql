-- run it manually to clear otp table
-- create event if not exist for auto delete all otp row
CREATE EVENT IF NOT EXISTS delete_old_data_every_two_hours
ON SCHEDULE EVERY 2 HOUR
DO
DELETE FROM `Otp` WHERE created_at < NOW() - INTERVAL 10 MINUTE;

-- to show event create or not
SHOW EVENTS;

-- drop event if exist
DROP EVENT IF EXISTS delete_old_data_every_two_hours;
