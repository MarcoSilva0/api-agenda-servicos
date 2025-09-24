/*
  Warnings:

  - You are about to drop the column `appointmentDate` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `appointmentTime` on the `Appointment` table. All the data in the column will be lost.
  - Added the required column `appointmentDateEnd` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `appointmentDateStart` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Appointment" DROP COLUMN "appointmentDate",
DROP COLUMN "appointmentTime",
ADD COLUMN     "appointmentDateEnd" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "appointmentDateStart" TIMESTAMP(3) NOT NULL;
