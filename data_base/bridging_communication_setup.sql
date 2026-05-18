-- 1. Create Database
CREATE DATABASE IF NOT EXISTS bridging_communication;
USE bridging_communication;

-- 2. User Table
CREATE TABLE User (
  userID      INT            NOT NULL AUTO_INCREMENT,
  firstName   VARCHAR(100)   NOT NULL,
  lastName    VARCHAR(100)   NOT NULL,
  email       VARCHAR(255)   NOT NULL,
  password    VARCHAR(255)   NOT NULL,
  username    VARCHAR(100)   NOT NULL,
  userType    ENUM('deaf', 'hearing', 'admin') NOT NULL,
  isBlocked   TINYINT(1)     NOT NULL DEFAULT 0,
  createdAt   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (userID),
  UNIQUE KEY uq_email (email),
  UNIQUE KEY uq_username (username)
) ENGINE=InnoDB;

-- 3. Sign Category Table
CREATE TABLE SignCategory (
  categoryID    INT           NOT NULL AUTO_INCREMENT,
  categoryName  VARCHAR(100)  NOT NULL,
  description   TEXT,
  PRIMARY KEY (categoryID),
  UNIQUE KEY uq_category_name (categoryName)
) ENGINE=InnoDB;

-- 4. Sign Language Table
CREATE TABLE SignLanguage (
  signID        INT           NOT NULL AUTO_INCREMENT,
  gestureName   VARCHAR(255)  NOT NULL,
  meaning       TEXT          NOT NULL,
  videoPath     VARCHAR(500),
  categoryID    INT,
  PRIMARY KEY (signID),
  CONSTRAINT fk_sign_category FOREIGN KEY (categoryID) REFERENCES SignCategory (categoryID) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5. Translation History Table
-- NOTE: Active history storage uses MongoDB (see data_base/init-db.js).
-- This table is retained for relational reporting queries and potential future migration.
CREATE TABLE TranslationHistory (
  historyID       INT           NOT NULL AUTO_INCREMENT,
  userID          INT           NOT NULL,
  inputType       ENUM('sign_to_text', 'speech_to_sign') NOT NULL,
  inputMode       ENUM('live', 'upload') NOT NULL,
  inputContent    TEXT,
  translationResult TEXT        NOT NULL,
  isFavorite      TINYINT(1)    DEFAULT 0,
  createdAt       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (historyID),
  CONSTRAINT fk_history_user FOREIGN KEY (userID) REFERENCES User (userID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Content Moderation Table
CREATE TABLE ContentModeration (
  modID         INT           NOT NULL AUTO_INCREMENT,
  userID        INT           NOT NULL,
  filePath      VARCHAR(255)  NOT NULL,
  status        ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  uploadedAt    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (modID),
  CONSTRAINT fk_moderation_user FOREIGN KEY (userID) REFERENCES User (userID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- Migration script: run this on an existing database
-- to add the isBlocked column without losing data.
-- -------------------------------------------------------
-- ALTER TABLE User ADD COLUMN isBlocked TINYINT(1) NOT NULL DEFAULT 0 AFTER userType;