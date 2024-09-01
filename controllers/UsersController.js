import dbClient from "../utils/db.js";
import sha1 from 'sha1';
class UsersController {
    static async postNew(req, res) {
        const email = req.body.email;
        if (!email) {
            return res.status(400).send('Missing email');
        }
        const password = req.body.password;
        if (!password) {
            return res.status(400).send('Missing password');
        }
        const user = await (await dbClient.usersCollection().findOne({email}));
        if (user)
            return res.status(400).send('Already exist')
        const inserted_info = await (await dbClient.usersCollection().insertOne({email, password: sha1(password)}));
        res.json({id: inserted_info.insertedId, email});
    }
}
export default UsersController;
