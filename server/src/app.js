const express = require("express");
const app = express();
const router = express.Router();
const cors = require("cors");
const dotenv = require("dotenv");
const HTTP_STATUS = require("./constants/httpStatus");
const prisma = require("./config/database");
dotenv.config();
app.use(cors());

router.get("/users/all", async (req, res) => {
    try {
        console.log(`${new Date().toISOString()} - All users request hit!`);
        let { page, limit } = req.query;

        if (!page && !limit) {
            page = 1;
            limit = 5;
        }

        if (page <= 0) {
            return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send({
                success: false,
                message: "Page value must be 1 or more",
                data: null,
            });
        }

        if (limit <= 0) {
            return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send({
                success: false,
                message: "Limit value must be 1 or more",
                data: null,
            });
        }

        const users = await prisma.user.findMany({
            skip: Number(page - 1) * Number(limit),
            take: Number(limit),
        });

        const total = await prisma.user.count();
        return res.status(HTTP_STATUS.OK).send({
            success: true,
            message: "Successfully received all users",
            data: {
                users: users,
                total: total,
            },
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
