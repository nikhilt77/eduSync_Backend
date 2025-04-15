const { Router } = require("express");
const router = Router();
const { Client } = require("pg");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const db = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});


db.connect();

// JWT Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send("Token required");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send("Invalid token");
    req.user = user; // Attach user data from token to request
    next();
  });
}

router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const result = await db.query(
      "SELECT * FROM admin_credentials WHERE username=$1 AND password=$2",
      [username, password],
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const user = result.rows[0];
    const token = jwt.sign(
      { username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1y" },
    );
    res.status(200).json({ message: "Login successful", user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/", authenticateToken, (req, res) => {
  res.send("Welcome to Admin Page");
});

router.post("/signup", async (req, res, next) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const query =
      "INSERT INTO admin_credentials(username, password, role) VALUES($1, $2, $3) RETURNING *";
    const values = [username, password, role];
    const result = await db.query(query, values);

    const token = jwt.sign({ username, role }, process.env.JWT_SECRET, {
      expiresIn: "100y",
    });

    res.status(200).json({
      message: "User created successfully",
      user: result.rows[0],
      token,
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/addStaff",
  authenticateToken,
  /*checkAdmin*/
  async (req, res, next) => {
    try {
      const { name, in_charge_of, course_charges, password } = req.body;
      if (!name) {
        return res.status(400).send("Name is required");
      } else if (!course_charges) {
        return res.status(400).send("Course charges is required");
      } else if (!password) {
        return res.status(400).send("Password is required");
      } else {
        const existingStaffQuery = `
                SELECT * FROM staff WHERE in_charge_of = $1
              `;
        const existingStaffResult = await db.query(existingStaffQuery, [
          in_charge_of,
        ]);

        if (existingStaffResult.rows.length > 0) {
          return res
            .status(409)
            .send(
              "Staff member already exists with the same name and in-charge-of department",
            );
        }
        if (in_charge_of != null) {
          const query2 = "SELECT * FROM classes where class = $1";
          const values2 = [in_charge_of];
          const result2 = await db.query(query2, values2);
          if (result2.rows.length === 0) {
            const insertClassQuery =
              "INSERT INTO classes(class) VALUES (UPPER($1))";
            await db.query(insertClassQuery, [in_charge_of]);
            const query3 = `CREATE TABLE IF NOT EXISTS public.schedule_${in_charge_of}
        (
            day character varying(10) COLLATE pg_catalog."default" NOT NULL,
            hours character varying(25)[] COLLATE pg_catalog."default",
            CONSTRAINT schedule_${in_charge_of}_pkey PRIMARY KEY (day)
            )
            TABLESPACE pg_default;

            ALTER TABLE IF EXISTS public.schedule_${in_charge_of}
                OWNER to ${process.env.postgresusername};`;
            const result3 = await db.query(query3);
            const query4 = `CREATE TABLE IF NOT EXISTS public.attendence_${in_charge_of}
          (
              att_id integer NOT NULL GENERATED ALWAYS AS IDENTITY (INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1),
              date_of_att date,
              day character varying(25) COLLATE pg_catalog."default",
              register_no character varying(25) COLLATE pg_catalog."default",
              course_no character varying(25) COLLATE pg_catalog."default",
              hour integer,
              att boolean,
              CONSTRAINT attendence_${in_charge_of}_pkey PRIMARY KEY (att_id),
              CONSTRAINT course_details FOREIGN KEY (course_no)
                  REFERENCES public.courses (course_no) MATCH SIMPLE
                  ON UPDATE NO ACTION
                  ON DELETE CASCADE
                  NOT VALID,
              CONSTRAINT studentdetails FOREIGN KEY (register_no)
                  REFERENCES public.student (register_no) MATCH SIMPLE
                  ON UPDATE NO ACTION
                  ON DELETE CASCADE
          )

          TABLESPACE pg_default;

          ALTER TABLE IF EXISTS public.attendence_${in_charge_of}
              OWNER to ${process.env.postgresusername};
`;
            const result4 = await db.query(query4);
            const query5 = `CREATE TABLE IF NOT EXISTS public.assignment_${in_charge_of}
        (
            assignment_no integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
            description character varying(1000) COLLATE pg_catalog."default",
            marks integer,
            due_date date,
            staff_no integer NOT NULL,
            course_no character varying(25) COLLATE pg_catalog."default",
            CONSTRAINT assignment_${in_charge_of}_pkey PRIMARY KEY (assignment_no),
            CONSTRAINT coursedetails FOREIGN KEY (course_no)
                REFERENCES public.courses (course_no) MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE CASCADE
                NOT VALID,
            CONSTRAINT staffdetails FOREIGN KEY (staff_no)
                REFERENCES public.staff (staff_no) MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE CASCADE
                NOT VALID
        )

        TABLESPACE pg_default;

        ALTER TABLE IF EXISTS public.assignment_${in_charge_of}
            OWNER to ${process.env.postgresusername};`;
            const result5 = await db.query(query5);
            const query6 = `CREATE TABLE IF NOT EXISTS public.assignment_marks_${in_charge_of}
        (
            assign_m_no integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
            total_marks integer,
            award_marks integer,
            assignment_no integer,
            register_no character varying(25) COLLATE pg_catalog."default",
            CONSTRAINT assignment_marks_${in_charge_of}_pkey PRIMARY KEY (assign_m_no),
            CONSTRAINT assignmentdetails FOREIGN KEY (assignment_no)
                REFERENCES public.assignment_${in_charge_of} (assignment_no) MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE CASCADE
                NOT VALID,
            CONSTRAINT studentdetails FOREIGN KEY (register_no)
                REFERENCES public.student (register_no) MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE CASCADE
                NOT VALID
        )

        TABLESPACE pg_default;

        ALTER TABLE IF EXISTS public.assignment_marks_${in_charge_of}
            OWNER to ${process.env.postgresusername};`;
            try {
              const result6 = await db.query(query6);
            } catch (err) {
              console.error("Error creating assignment_marks table:", err);
            }
          }
          console.log("Table created successfully");
        }
        const query =
          "INSERT INTO staff(name,in_charge_of,course_charges,password) VALUES($1,$2,$3,$4) RETURNING *";
        const values = [name, in_charge_of, course_charges, password];
        const result = await db.query(query, values);
        res.status(200).send(result.rows[0]);
      }
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/viewStaff",
  authenticateToken,
  /*checkAdmin,*/
  async (req, res, next) => {
    try {
      const query =
        "SELECT staff_no,name,in_charge_of,course_charges FROM staff";
      const result = await db.query(query);
      res.status(200).send(result.rows);
    } catch (err) {
      next(err);
    }
  },
);
router.put("/editStaff", authenticateToken, async (req, res, next) => {
  const { staff_no, name, in_charge_of, course_charges, password } = req.body;

  try {
    const query = "SELECT * FROM staff WHERE staff_no=$1";
    const values = [staff_no];
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(400).send("Staff number does not exist");
    }

    const currentDetails = result.rows[0];
    if (!name && !in_charge_of && !course_charges && !password) {
      return res.status(200).send({
        message: "Current staff details",
        staffDetails: currentDetails,
      });
    }

    const updatedName = name || currentDetails.name;
    const updatedInChargeOf = in_charge_of || currentDetails.in_charge_of;
    const updatedCourseCharges =
      course_charges || currentDetails.course_charges;
    const updatedPassword = password || currentDetails.password;

    if (updatedInChargeOf !== currentDetails.in_charge_of) {
      const checkClassQuery = `
              SELECT * FROM staff WHERE in_charge_of = $1 AND staff_no != $2
            `;
      const checkClassResult = await db.query(checkClassQuery, [
        updatedInChargeOf,
        staff_no,
      ]);

      if (checkClassResult.rows.length > 0) {
        return res
          .status(400)
          .send("This class is already assigned to another staff member.");
      }
      const classCheckQuery = "SELECT * FROM classes WHERE class = $1";
      const classCheckResult = await db.query(classCheckQuery, [
        updatedInChargeOf,
      ]);

      if (classCheckResult.rows.length === 0) {
        const insertClassQuery =
          "INSERT INTO classes(class) VALUES (UPPER($1))";
        await db.query(insertClassQuery, [updatedInChargeOf]);
      }
    }

    const updateQuery = `
        UPDATE staff
        SET name=$1, in_charge_of=$2, course_charges=$3, password=$4
        WHERE staff_no=$5 RETURNING *
      `;
    const updateValues = [
      updatedName,
      updatedInChargeOf,
      updatedCourseCharges,
      updatedPassword,
      staff_no,
    ];
    const updateResult = await db.query(updateQuery, updateValues);

    const scheduleQuery = `
        CREATE TABLE IF NOT EXISTS public.schedule_${updatedInChargeOf} (
            day character varying(10) NOT NULL,
            hours character varying(25)[],
            CONSTRAINT schedule_${updatedInChargeOf}_pkey PRIMARY KEY (day)
        );
        ALTER TABLE IF EXISTS public.schedule_${updatedInChargeOf}
            OWNER to ${process.env.postgresusername};
      `;
    await db.query(scheduleQuery);

    const attendanceQuery = `
      CREATE TABLE IF NOT EXISTS public.attendence_${updatedInChargeOf} (
          att_id integer NOT NULL GENERATED ALWAYS AS IDENTITY (INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1),
          date_of_att date,
          day character varying(25) COLLATE pg_catalog."default",
          register_no character varying(25) COLLATE pg_catalog."default",
          course_no character varying(25) COLLATE pg_catalog."default",
          hour integer,
          att boolean,
          CONSTRAINT attendence_${updatedInChargeOf}_pkey PRIMARY KEY (att_id),
          CONSTRAINT course_details FOREIGN KEY (course_no)
              REFERENCES public.courses (course_no) MATCH SIMPLE
              ON UPDATE NO ACTION
              ON DELETE CASCADE
              NOT VALID,
          CONSTRAINT studentdetails FOREIGN KEY (register_no)
              REFERENCES public.student (register_no) MATCH SIMPLE
              ON UPDATE NO ACTION
              ON DELETE CASCADE
      );

      ALTER TABLE IF EXISTS public.attendence_${updatedInChargeOf}
          OWNER to ${process.env.postgresusername};
      `;
    await db.query(attendanceQuery);

    const assignmentQuery = `
        CREATE TABLE IF NOT EXISTS public.assignment_${updatedInChargeOf} (
            assignment_no integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
            description character varying(1000),
            marks integer,
            due_date date,
            staff_no integer NOT NULL,
            course_no character varying,
            CONSTRAINT assignment_${updatedInChargeOf}_pkey PRIMARY KEY (assignment_no),
            CONSTRAINT coursedetails FOREIGN KEY (course_no)
                REFERENCES public.courses (course_no) MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE CASCADE
                NOT VALID,
            CONSTRAINT staffdetails FOREIGN KEY (staff_no)
                REFERENCES public.staff (staff_no) MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE CASCADE
                NOT VALID
        );
        ALTER TABLE IF EXISTS public.assignment_${updatedInChargeOf}
            OWNER to ${process.env.postgresusername};
      `;
    await db.query(assignmentQuery);

    const assignmentMarksQuery = `
        CREATE TABLE IF NOT EXISTS public.assignment_marks_${updatedInChargeOf} (
            assign_m_no integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
            total_marks integer,
            award_marks integer,
            assignment_no integer,
            register_no character varying,
            CONSTRAINT assignment_marks_${updatedInChargeOf}_pkey PRIMARY KEY (assign_m_no),
            CONSTRAINT assignmentdetails FOREIGN KEY (assignment_no)
                REFERENCES public.assignment_${updatedInChargeOf} (assignment_no) MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE CASCADE
                NOT VALID,
            CONSTRAINT studentdetails FOREIGN KEY (register_no)
                REFERENCES public.student (register_no) MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE CASCADE
                NOT VALID
        );
        ALTER TABLE IF EXISTS public.assignment_marks_${updatedInChargeOf}
            OWNER to ${process.env.postgresusername};
      `;
    await db.query(assignmentMarksQuery);

    res.status(200).send({
      message: "Staff details updated successfully",
      updatedDetails: updateResult.rows[0],
    });
  } catch (err) {
    next(err);
  }
});

router.get(
  "/viewStaffAdvisor",
  authenticateToken,
  /*checkAdmin,*/
  async (req, res, next) => {
    try {
      const result = await db.query(
        "SELECT * FROM staff WHERE in_charge_of IS NOT NULL",
      );
      res.status(200).send(result.rows);
    } catch (err) {
      next(err);
    }
  },
);
router.delete("/deleteClass", async (req, res, next) => {
  const className = req.body.class;
  try {
    const query = "DELETE FROM classes WHERE class=UPPER($1)";
    const values = [className];
    const result = await db.query(query, values);
    res.status(200).send("Class deleted");
    const query2 = `DROP TABLE IF EXISTS public.schedule_${className},
      public.attendence_${className},
      public.assignment_${className},
      public.assignment_marks_${className};`;
    const result2 = await db.query(query2);
  } catch (err) {
    next(err);
    res.redirect("/deleteClass");
  }
});
router.get("/showClasses", async (req, res, next) => {
  try {
    const result = await db.query(`SELECT * FROM classes`);
    res.status(200).send(result.rows);
  } catch (err) {
    console.log("Classes not fetched");
    next(err);
  }
});
function checkAdmin(req, res, next) {
  const role = req.user.role;
  if (role !== "admin") {
    return res.status(401).send("Unauthorized");
  }
  next();
}

module.exports = router;
