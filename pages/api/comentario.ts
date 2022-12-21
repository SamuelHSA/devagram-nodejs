import type { NextApiRequest, NextApiResponse } from 'next';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { politicaCORS } from '../../middlewares/politicaCORS';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { publicacaoModel } from '../../models/publicacaoModel';
import { UsuarioModel } from '../../models/UsuarioModel';
import type { respostaPadraoMsg } from '../../types/respostaPadraoMsg'

const comentarioEndpoint = async (req : NextApiRequest, res : NextApiResponse<respostaPadraoMsg>) => {
    try {
        if(req.method === 'PUT') {
            const {userId, id} = req.query;
            const usuarioLogado = await UsuarioModel.findById(userId);
            if(!usuarioLogado) {
                return res.status(400).json({erro : 'Usuário não encontrado'});
            }

            const publicacao = await publicacaoModel.findById(id);
            if(!publicacao) {
                return res.status(400).json({erro : 'Publicacao não encontrado'});
            }

            if(!req.body || !req.body.comentario
                || req.body.comentario.length < 2) {
                return res.status(400).json({erro : 'Comentário não é válido'});
            }
            
            const comentario = {
                usuarioId : usuarioLogado._id,
                nome : usuarioLogado.nome,
                comentario : req.body.comentario
            }

            publicacao.comentarios.push(comentario);
            await publicacaoModel.findByIdAndUpdate({_id : publicacao._id}, publicacao);
            return res.status(200).json({msg : 'Comentário adicionado!'});
        }

        return res.status(405).json({erro : 'Método informado não é válido'});
    }catch(e){
        console.log(e);
        return res.status(500).json({erro : 'Ocorreu um erro ao Comentar'});
    }
}

export default politicaCORS( validarTokenJWT(conectarMongoDB(comentarioEndpoint)));