const express = require("express");
const app = express();
const router = express.Router();
const cors = require("cors");
const users = require("./server/users.json");
const dotenv = require("dotenv");
dotenv.config();
app.use(cors());

router.get("/users/all", (req, res) => {
    try {
        console.log(`${new Date().toISOString()} - All users request hit!`);
        res.set("Cache-Control", "public, max-age=31557600");
        return res.status(200).send({
            success: true,
            message: "Successfully received all users",
            data: users,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }
});

router.get(`/user/:id`, (req, res) => {
    try {
        console.log(`${new Date().toISOString()} - Single user request hit!`);
        const { id } = req.params;

        res.set("Cache-Control", "public, max-age=31557600");
        const result = users.filter((element) => element.id === Number(id));

        if (result.length === 1) {
            return res.status(200).send({
                success: true,
                message: `Successfully received user with id: ${id}`,
                data: result[0],
            });
        }
        return res.status(404).send({
            success: false,
            message: "Could not find user",
            data: null,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }
});

app.use("/", router);

app.listen(process.env.PORT, () => {
    console.log(`Listening to port: ${process.env.PORT}`);
});
