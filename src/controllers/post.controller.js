// post constroller dans le sens les postes dans le feed, pas dans le sens l'opération POST
import { Post } from "../models/post.model.js";

const createPost = async (req, res) => {
    try {
        const { name, description, age } = req.body;

        if(!name || !description || !age) {
            return res.status(400).json({
                message: "tous les champs doivent être remplis"
            });
        }

        const post = await Post.create({ name, description, age });

        res.status(201).json({
            message: "post crée", 
            post
        });

    } catch (error) {
        res.status(500).json({
            message: "internal serv error", error
        });
    }
}

const getPosts = async (req, res) => {
    try {
        const getPostFeed = await Post.find();
        res.status(200).json(getPostFeed)

    } catch (error) {
        res.status(500).json({
            message: "internal serv error", error
        })
    }
}

const updatePost = async (req, res) => {
    try {
        // {name: x, description: y, age: z} -> object.keys -> [name, description, age] 
        // les éléments du tableau sont les clés, il y a 3 champs dans le tableau.
        // si la requete n'a aucun champs, alors il y a 0 clés. 
        // donc ça peut être utilisé dans un statement pour refuser une requete sans contenu de cette manière :
        if (Object.keys(req.body).length === 0) { // 0 clés
            return res.status(400).json({
                message: "aucune données reçues"
            });
        }

        const post = await Post.findByIdAndUpdate(req.params.id, req.body, {returnDocument: "after"}); //params.id veut dire qu'il va chercher dans l'URL

        if(!post) {
            return res.status(404).json({
                message: "post pas trouvé"
            });
        }

        res.status(200).json({
            message: "post mis à jour", post
        });

    } catch (error) {
        res.status(500).json({
            message: "internal serv error", error
        });
    }
}

const deletePost = async (req, res) => {
    try {
        const target = await Post.findByIdAndDelete(req.params.id, {returnDocument: "after"});
        
        if(!target) {
            return res.status(404).json({
                message: "post pas trouvé"
            });
        }

        res.status(200).json({
            message: "post supprimé", target
        });

    } catch (error) {
        res.status(500).json({
            message: "internal serv error"
        });
    }
}

export {
    createPost,
    getPosts,
    updatePost,
    deletePost
};