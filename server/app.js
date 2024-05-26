const express = require("express");
const app = express();
const router = express.Router();
const cors = require("cors");
// const users = require("./server/users.json");
const dotenv = require("dotenv");
const HTTP_STATUS = require("./constants/httpStatus");
const prisma = require("./config/database");
dotenv.config();
app.use(cors());

router.get("/users/all", async (req, res) => {
    try {
        console.log(`${new Date().toISOString()} - All users request hit!`);

        const users = await prisma.user.findMany({});
        return res.status(HTTP_STATUS.OK).send({
            success: true,
            message: "Successfully received all users",
            data: users,
        });
    } catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
            success: false,
            message: "Internal server error",
        });
    }
});

router.get(`/user/:id`, async (req, res) => {
    try {
        console.log(`${new Date().toISOString()} - Single user request hit!`);
        const { id } = req.params;

        const result = await prisma.user.findFirst({ where: { id: Number(id) } });

        if (result) {
            return res.status(HTTP_STATUS.OK).send({
                success: true,
                message: `Successfully received user with id: ${id}`,
                data: result,
            });
        }
        return res.status(HTTP_STATUS.NOT_FOUND).send({
            success: false,
            message: "Could not find user",
            data: null,
        });
    } catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
            success: false,
            message: "Internal server error",
        });
    }
});

app.use("/", router);

app.listen(process.env.PORT, () => {
    console.log(`Listening to port: ${process.env.PORT}`);
});
