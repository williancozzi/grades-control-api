import express from "express";
import { promises as fs } from "fs";

global.fileName = "grades.json";

const router = express.Router();
const { readFile, writeFile } = fs;

const readGradesFile = async () => {
  return JSON.parse(await readFile(global.fileName));
};

router.get("/", async (req, res, next) => {
  try {
    const data = await readGradesFile();

    delete data.nextId;

    res.send(data);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    let grade = req.body;

    const data = await readGradesFile();

    grade = {
      id: data.nextId++,
      student: grade.student,
      subject: grade.subject,
      type: grade.type,
      value: grade.value,
      timestamp: new Date(),
    };

    data.grades.push(grade);

    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    res.send(grade);
  } catch (error) {
    next(error);
  }
});

router.put("/", async (req, res, next) => {
  try {
    const grade = req.body;

    // valida id
    if (!grade.id) {
      throw new Error("Id is required");
    }

    const data = await readGradesFile();
    const index = data.grades.findIndex((grd) => grd.id === grade.id);

    if (index === -1) {
      throw new Error("Id not found");
    }

    data.grades[index].student = grade.student;
    data.grades[index].subject = grade.subject;
    data.grades[index].type = grade.type;
    data.grades[index].value = grade.value;
    data.grades[index].timestamp = new Date();

    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    res.send(data);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const data = await readGradesFile();

    data.grades = data.grades.filter(
      (grade) => grade.id !== parseInt(req.params.id)
    );

    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    res.end();
  } catch (error) {
    next(error);
  }
});

export default router;