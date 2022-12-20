import type { NextApiRequest, NextApiResponse } from "next";
import { conectarMongoDB } from "../../middlewares/conectarMongoDB";
import { validarTokenJWT } from "../../middlewares/validarTokenJWT";
import { publicacaoModel } from "../../models/publicacaoModel";
import { UsuarioModel } from "../../models/UsuarioModel";
import type { respostaPadraoMsg } from '../../types/respostaPadraoMsg';

const likeEndpoint 
    = async (req : NextApiRequest, res : NextApiResponse<respostaPadraoMsg>) => {

    try {
        if(req.method === 'PUT') {
            // id da Publicação
            const {id} = req?.query;
            const publicacao = await publicacaoModel.findById(id);
            if(!publicacao) {
                res.status(400).json({erro : 'Publicação não encontrada'});
            }

            // id do usuário que está curtindo
            const {userId} = req?.query;
            const usuario = await UsuarioModel.findById(userId);
            if(!usuario) {
                return res.status(400).json({erro : 'Usuário não encontrado'});
            }

            const indexDoUsuarioNoLike = publicacao.likes.findIndex((e : any) => e.toString() === usuario._id.toString());

            // Se o index for > -1 é sinal que ele já curtiu a foto
            if(indexDoUsuarioNoLike != -1) {
                publicacao.likes.splice(indexDoUsuarioNoLike, 1);
                await publicacaoModel.findByIdAndUpdate({_id : publicacao._id}, publicacao);
                return res.status(200).json({msg : 'Publicação descurtida'});
            }else {
                // Se o index for -1 é sinal que ele não curtiu a foto
                publicacao.likes.push(usuario._id);
                await publicacaoModel.findByIdAndUpdate({_id : publicacao._id}, publicacao);
                return res.status(200).json({erro : 'Publicação curtida'})
            }
        }

        return res.status(405).json({erro : 'Método informado não é válido'});
    }catch (e) {
        console.log(e);
        return res.status(500).json({erro : 'Ocorreu um erro ao curtir/descurtir uma publicação'});
    }
}

export default validarTokenJWT(conectarMongoDB(likeEndpoint));  