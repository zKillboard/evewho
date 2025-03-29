-- MySQL dump 10.13  Distrib 8.0.41, for Linux (x86_64)
--
-- Host: localhost    Database: evewho
-- ------------------------------------------------------
-- Server version	8.0.41-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ew_alliances`
--

DROP TABLE IF EXISTS `ew_alliances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ew_alliances` (
  `alliance_id` int NOT NULL,
  `faction_id` int NOT NULL DEFAULT '0',
  `memberCount` int DEFAULT NULL,
  `corp_count` int NOT NULL DEFAULT '0',
  `name` varchar(128) CHARACTER SET latin1 NOT NULL,
  `name_phonetic` varchar(64) CHARACTER SET latin1 DEFAULT NULL,
  `ticker` varchar(6) CHARACTER SET latin1 NOT NULL,
  `executor_corp` int NOT NULL,
  `lastUpdated` timestamp NULL DEFAULT '0000-00-00 00:00:00',
  `mc_2` int NOT NULL DEFAULT '0',
  `mc_3` int NOT NULL DEFAULT '0',
  `mc_4` int NOT NULL DEFAULT '0',
  `mc_5` int NOT NULL DEFAULT '0',
  `mc_6` int NOT NULL DEFAULT '0',
  `mc_7` int NOT NULL DEFAULT '0',
  `diff` int NOT NULL,
  `avg_sec_status` decimal(2,1) DEFAULT NULL,
  `recalc` tinyint(1) NOT NULL DEFAULT '1',
  `description` varchar(4096) CHARACTER SET latin1 DEFAULT NULL,
  PRIMARY KEY (`alliance_id`),
  KEY `name` (`name`),
  KEY `member_count` (`memberCount`),
  KEY `diff` (`diff`),
  KEY `avg_sec_status` (`avg_sec_status`),
  KEY `ticker` (`ticker`),
  KEY `name_phonetic` (`name_phonetic`),
  KEY `recalc` (`recalc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ew_characters`
--

DROP TABLE IF EXISTS `ew_characters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ew_characters` (
  `character_id` int NOT NULL,
  `corporation_id` int NOT NULL,
  `alliance_id` int NOT NULL,
  `faction_id` int NOT NULL DEFAULT '0',
  `name` varchar(128) CHARACTER SET latin1 NOT NULL,
  `name_phonetic` varchar(64) CHARACTER SET latin1 DEFAULT NULL,
  `sec_status` decimal(3,1) DEFAULT NULL,
  `lastUpdated` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `history_added` tinyint(1) NOT NULL DEFAULT '0',
  `lastAffUpdated` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `recent_change` int DEFAULT '1',
  `lastEmploymentChange` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  UNIQUE KEY `character_id` (`character_id`),
  KEY `corporation_id` (`corporation_id`),
  KEY `alliance_id` (`alliance_id`),
  KEY `name` (`name`),
  KEY `sec_status` (`sec_status`),
  KEY `name_phonetic` (`name_phonetic`),
  KEY `lastUpdated` (`lastUpdated`),
  KEY `history_added` (`history_added`),
  KEY `corporation_id_2` (`corporation_id`,`lastUpdated`),
  KEY `lastAffUpdated` (`lastAffUpdated`),
  KEY `recent_change` (`recent_change`,`lastUpdated`),
  KEY `lastUpdated_2` (`lastUpdated`,`recent_change`),
  KEY `corporation_id_3` (`corporation_id`,`recent_change`,`lastUpdated`,`lastAffUpdated`),
  KEY `corporation_id_4` (`corporation_id`,`recent_change`,`lastUpdated`,`lastAffUpdated`,`lastEmploymentChange`),
  KEY `lastEmploymentChange` (`lastEmploymentChange`),
  KEY `lastEmploymentChange_2` (`lastEmploymentChange`,`lastAffUpdated`),
  KEY `lastAffUpdated_2` (`lastAffUpdated`,`lastEmploymentChange`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ew_corporations`
--

DROP TABLE IF EXISTS `ew_corporations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ew_corporations` (
  `corporation_id` int NOT NULL,
  `faction_id` int NOT NULL DEFAULT '0',
  `alliance_id` int NOT NULL DEFAULT '0',
  `name` varchar(128) CHARACTER SET latin1 NOT NULL,
  `name_phonetic` varchar(64) CHARACTER SET latin1 DEFAULT NULL,
  `is_npc_corp` tinyint(1) NOT NULL DEFAULT '0',
  `mc_2` int NOT NULL DEFAULT '0',
  `mc_3` int NOT NULL DEFAULT '0',
  `mc_4` int NOT NULL DEFAULT '0',
  `mc_5` int NOT NULL DEFAULT '0',
  `mc_6` int NOT NULL DEFAULT '0',
  `mc_7` int NOT NULL DEFAULT '0',
  `diff` int NOT NULL,
  `modulus` int DEFAULT NULL,
  `ticker` varchar(6) CHARACTER SET latin1 DEFAULT NULL,
  `ceoID` int NOT NULL DEFAULT '0',
  `description` varchar(8192) CHARACTER SET latin1 DEFAULT NULL,
  `url` varchar(256) CHARACTER SET latin1 DEFAULT NULL,
  `taxRate` int NOT NULL DEFAULT '0',
  `memberCount` int NOT NULL DEFAULT '0',
  `avg_sec_status` decimal(2,1) NOT NULL DEFAULT '0.0',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `lastUpdated` timestamp NULL DEFAULT '0000-00-00 00:00:00',
  `recalc` tinyint(1) NOT NULL DEFAULT '1',
  UNIQUE KEY `corporation_id` (`corporation_id`),
  KEY `isNpcCorp` (`is_npc_corp`),
  KEY `name` (`name`),
  KEY `alliance_id` (`alliance_id`),
  KEY `diff` (`diff`),
  KEY `modulus` (`modulus`),
  KEY `avg_sec_status` (`avg_sec_status`),
  KEY `active` (`active`),
  KEY `faction_id` (`faction_id`),
  KEY `ticker` (`ticker`),
  KEY `name_phonetic` (`name_phonetic`),
  KEY `lastUpdated` (`lastUpdated`),
  KEY `member_count_2` (`alliance_id`,`corporation_id`,`active`),
  KEY `lastUpdated_2` (`lastUpdated`),
  KEY `memberCount` (`memberCount`),
  KEY `recalc` (`recalc`),
  KEY `npc_alli` (`is_npc_corp`,`alliance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ew_factions`
--

DROP TABLE IF EXISTS `ew_factions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ew_factions` (
  `faction_id` int NOT NULL,
  `name` varchar(32) NOT NULL,
  PRIMARY KEY (`faction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ew_history`
--

DROP TABLE IF EXISTS `ew_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ew_history` (
  `record_id` int NOT NULL,
  `character_id` int NOT NULL,
  `corporation_id` int NOT NULL,
  `corp_number` int NOT NULL,
  `start_date` timestamp NULL DEFAULT NULL,
  `end_date` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`record_id`),
  KEY `corporation_id` (`corporation_id`),
  KEY `character_id` (`character_id`),
  KEY `start_date` (`start_date`),
  KEY `end_date` (`end_date`),
  KEY `corp_number` (`corp_number`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-29 15:15:08
