-- phpMyAdmin SQL Dump
-- version 4.9.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Sep 18, 2020 at 07:42 PM
-- Server version: 10.3.23-MariaDB-0+deb10u1
-- PHP Version: 7.3.19-1~deb10u1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `friend-time`
--

DELIMITER $$
--
-- Procedures
--
CREATE PROCEDURE `Server_Get` (IN `IN_DiscordId` VARCHAR(20))  BEGIN

INSERT INTO Server (DiscordId)
VALUES (IN_DiscordId)
ON DUPLICATE KEY UPDATE ServerId = ServerId;

SELECT *
FROM Server
WHERE DiscordId = IN_DiscordId
LIMIT 1;

END$$

CREATE PROCEDURE `Server_SetMode` (IN `IN_DiscordId` VARCHAR(20), IN `IN_Mode` VARCHAR(20))  BEGIN

INSERT INTO Server (
    DiscordId,
    `Mode`
) VALUES (
    IN_DiscordId,
    IN_Mode
)
ON DUPLICATE KEY UPDATE `Mode` = IN_Mode;

END$$

CREATE PROCEDURE `Server_SetNotify` (IN `IN_DiscordId` VARCHAR(20), IN `IN_Notify` TINYINT(1))  BEGIN

INSERT INTO Server (
    DiscordId,
    Notify
) VALUES (
    IN_DiscordId,
    IN_Notify
)
ON DUPLICATE KEY UPDATE Notify = IN_Notify;

END$$

CREATE PROCEDURE `Server_SetTimeFormat` (IN `IN_DiscordId` VARCHAR(20), IN `IN_TimeFormat` VARCHAR(20))  BEGIN

INSERT INTO Server (
    DiscordId,
    TimeFormat
) VALUES (
    IN_DiscordId,
    IN_TimeFormat
)
ON DUPLICATE KEY UPDATE TimeFormat = IN_TimeFormat;

END$$

CREATE PROCEDURE `Stats_TopTimeZones` ()  BEGIN

SELECT
    TimeZone,
    COUNT(*) AS 'Count'
FROM User
GROUP BY TimeZone
ORDER BY COUNT(*) DESC;

END$$

CREATE PROCEDURE `User_Get` (IN `IN_DiscordId` VARCHAR(20))  BEGIN

SELECT *
FROM User
WHERE DiscordId = IN_DiscordId
LIMIT 1;

END$$

CREATE PROCEDURE `User_GetDistinctTimeZones` (IN `IN_DiscordIds` MEDIUMTEXT)  BEGIN

SELECT DISTINCT TimeZone
FROM User
WHERE
    FIND_IN_SET(DiscordId, IN_DiscordIds) > 0
    AND TimeZone IS NOT NULL;

END$$

CREATE PROCEDURE `User_SetTimeFormat` (IN `IN_DiscordId` VARCHAR(20), IN `IN_TimeFormat` VARCHAR(20))  BEGIN

SET @UserId = NULL;
SELECT UserId
INTO @UserId
FROM User
WHERE DiscordId = IN_DiscordId;

IF @UserId IS NULL THEN
    INSERT INTO User (
        DiscordId,
        TimeFormat
    ) VALUES (
        IN_DiscordId,
        IN_TimeFormat
    );
ELSE
    UPDATE User
    SET TimeFormat = IN_TimeFormat
    WHERE UserId = @UserId;
END IF;

END$$

CREATE PROCEDURE `User_SetTimeZone` (IN `IN_DiscordId` VARCHAR(20), IN `IN_TimeZone` VARCHAR(100))  BEGIN

SET @UserId = NULL;
SELECT UserId
INTO @UserId
FROM User
WHERE DiscordId = IN_DiscordId;

IF @UserId IS NULL THEN
    INSERT INTO User (
        DiscordId,
        TimeZone
    ) VALUES (
        IN_DiscordId,
        IN_TimeZone
    );
ELSE
    UPDATE User
    SET TimeZone = IN_TimeZone
    WHERE UserId = @UserId;
END IF;

END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `Server`
--

CREATE TABLE `Server` (
  `ServerId` int(11) NOT NULL,
  `DiscordId` varchar(20) NOT NULL,
  `Mode` varchar(20) DEFAULT NULL,
  `TimeFormat` varchar(20) DEFAULT NULL,
  `Notify` tinyint(1) DEFAULT NULL,
  `Created` datetime NOT NULL DEFAULT current_timestamp(),
  `Modified` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `User`
--

CREATE TABLE `User` (
  `UserId` int(11) NOT NULL,
  `DiscordId` varchar(20) NOT NULL,
  `TimeZone` varchar(100) DEFAULT NULL,
  `TimeFormat` varchar(20) DEFAULT NULL,
  `Created` datetime NOT NULL DEFAULT current_timestamp(),
  `Modified` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Server`
--
ALTER TABLE `Server`
  ADD PRIMARY KEY (`ServerId`) USING BTREE,
  ADD UNIQUE KEY `UK_Server_DiscordId` (`DiscordId`) USING BTREE;

--
-- Indexes for table `User`
--
ALTER TABLE `User`
  ADD PRIMARY KEY (`UserId`) USING BTREE,
  ADD UNIQUE KEY `UK_User_DiscordId` (`DiscordId`) USING BTREE;

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Server`
--
ALTER TABLE `Server`
  MODIFY `ServerId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `User`
--
ALTER TABLE `User`
  MODIFY `UserId` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
