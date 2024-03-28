import CompanyModel from "../models/company.models.js";
import User from "../models/user.models.js";



export const followPerson = async (req, res) => {
    const authorizationHeader = req.headers['authorization'];
    console.log("header", req.headers);
    const token = authorizationHeader.split(' ')[1]; // Obtén solo el token, omitiendo 'Bearer'

    if (token === 'null') {
        return res.status(401).json({ message: "Unauthorized 1" });
    }

    const { userFollow } = req.body;
    let clientFound = await User.findOne({username: userFollow});
    let vendedorFound = await CompanyModel.findOne({userName: userFollow});

    console.log("client: ", clientFound);
    console.log("vendedor: ",vendedorFound);

    if (clientFound) {
        try {
            // Verificar si el usuario ya está siendo seguido
            const isFollowing = clientFound.followers.some(follower => follower.username === userFollow);
            if (!isFollowing) {
                await User.findOneAndUpdate(
                    {username: userFollow},
                    {
                        $push: {
                            followers: {
                                username: userFollow
                            }
                        }
                    }
                );
            }
            clientFound = await User.findOne({username: userFollow});
            return res.json(
                {
                    followers: clientFound.followers
                }
            )
        } catch (error) {
            console.log(error);
        }
    } else if(vendedorFound) {
        try {
            // Verificar si el usuario ya está siendo seguido
            const isFollowing = vendedorFound.followers.some(follower => follower.username === userFollow);
            if (!isFollowing) {
                await CompanyModel.findOneAndUpdate(
                    {userName: userFollow},
                    {
                        $push: {
                            followers: {
                                username: userFollow
                            }
                        }
                    }
                );
            }
            vendedorFound = await CompanyModel.findOne({userName: userFollow});
            return res.json(
                {
                    followers: vendedorFound.followers
                }
            )
        } catch (error) {
            console.log(error);
        }
    } else {
        return res.status(404).json({message: "Not found"})
    }
}
