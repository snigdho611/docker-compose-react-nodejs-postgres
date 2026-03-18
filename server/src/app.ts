import express, { Request, Response } from "express";
import cors from "cors"
import dotenv from "dotenv";
import HTTP_STATUS from "./constants/httpStatus";
dotenv.config({ path: "./.env" });
import prisma from "./config/database";


const app = express();
const router = express.Router();
app.use(cors());

router.get("/users/all", async (req, res) => {
    try {
        console.log(`${new Date().toISOString()} - All users request hit!`);
        const { page, limit } = req.query;
        let _page: string = "1";
        let _limit: string = "1";

        if (!page && !limit) {
            _page = (1).toString();
            _limit = (5).toString();;
        }

        if (parseInt((_page).toString()) <= 0) {
            console.log('o')
            return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send({
                success: false,
                message: "Page value must be 1 or more",
                data: null,
            });
        }

        if (parseInt((_limit).toString()) <= 0) {
            return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send({
                success: false,
                message: "Limit value must be 1 or more",
                data: null,
            });
        }

        const users = await prisma.user.findMany({
            skip: Number((parseInt(_page.toString()) - 1)) * Number(limit),
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

router.get(`/user/:id`, async (req: Request, res: Response) => {
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