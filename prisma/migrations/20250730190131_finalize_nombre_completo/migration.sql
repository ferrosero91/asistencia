/*
  Warnings:

  - You are about to drop the column `apellidos` on the `estudiantes` table. All the data in the column will be lost.
  - You are about to drop the column `nombres` on the `estudiantes` table. All the data in the column will be lost.
  - Made the column `nombreCompleto` on table `estudiantes` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "estudiantes" DROP COLUMN "apellidos",
DROP COLUMN "nombres",
ALTER COLUMN "nombreCompleto" SET NOT NULL;
