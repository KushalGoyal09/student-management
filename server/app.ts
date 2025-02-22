import express from "express";
import "dotenv/config";
import "express-async-errors";
import Secret from "./utils/secrets";
import notFound from "./middleware/notFound";
import errorHandler from "./middleware/errorHandler";
const port = Secret.PORT;
const app = express();
import loginRouter from "./router/Login";
import addRouter from "./router/Add";
import adminRouter from "./router/Admin";
import meRouter from "./router/Me/me";
import detailRouter from "./router/Detail";
import profileRouter from "./router/Profile";
import admissionRouter from "./router/NewStudent";
import callRouter from "./router/Call";
import syallabusRouter from "./router/Syallabus";
import targetRouter from "./router/Target";
import ratingRouter from "./router/Rating";
import ticketRouter from "./router/Ticket";
import slaryRouter from "./router/MentorSalary";
import visionBoardRouter from "./router/VisionBoard";
import overallRouter from "./router/OverallSyallabus";
import roleRouter from "./router/RoleManagement";
import assignRouter from "./router/Assaign";
import seniorCallRouter from "./router/SeniorCall";
import premadeTargetRouter from "./router/premadeTarget";
import cors from "cors";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/me", meRouter);
app.use("/api/login", loginRouter);
app.use("/api/add", addRouter);
app.use("/api/admin", adminRouter);
app.use("/api/detail", detailRouter);
app.use("/api/profile", profileRouter);
app.use("/api/new", admissionRouter);
app.use("/api/call", callRouter);
app.use("/api/syllabus", syallabusRouter);
app.use("/api/target", targetRouter);
app.use("/api/rating", ratingRouter);
app.use("/api/ticket", ticketRouter);
app.use("/api/salary", slaryRouter);
app.use("/api/vision", visionBoardRouter);
app.use("/api/overall", overallRouter);
app.use("/api/role", roleRouter);
app.use("/api/assaign", assignRouter);
app.use("/api/seniorCall", seniorCallRouter);
app.use("/api/premadeTarget", premadeTargetRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server listening to the port ${port}`);
});
