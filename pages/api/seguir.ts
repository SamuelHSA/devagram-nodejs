import type { NextApiRequest, NextApiResponse } from "next";
import { conectarMongoDB } from "../../middlewares/conectarMongoDB";
import { validarTokenJWT } from "../../middlewares/validarTokenJWT";
import { seguidorModel } from "../../models/SeguidorModel";
import { UsuarioModel } from "../../models/UsuarioModel";
import type { respostaPadraoMsg } from '../../types/respostaPadraoMsg';


const endpointSeguir = 
    async (req : NextApiRequest, res : NextApiResponse<respostaPadraoMsg>) => {
    try {
        if(req.method === 'PUT') {

            const {userId, id} = req?.query;

            // Usuário logado
            const usuarioLogado = await UsuarioModel.findById(userId);
            if(!usuarioLogado) {
                return res.status(400).json({erro : 'Usuário logado não encontrado'});
            }

            // Id do usuário a ser seguido - query
            const usuarioASerSeguido = await UsuarioModel.findById(id);
            if(!usuarioASerSeguido) {
                return res.status(400).json({erro : 'Usuário a ser seguido não encontrado'});
            }

            // Buscar se EU sigo ou não esse usuário
            const euJaSigoEsseUsuario = await seguidorModel
                .find({usuarioId: usuarioLogado._id, usuarioSeguidoId : usuarioASerSeguido._id});
            if(euJaSigoEsseUsuario && euJaSigoEsseUsuario.length > 0) {
                // Sinal que eu já sigo esse usuário
                euJaSigoEsseUsuario.forEach(async(e : any) => await seguidorModel.findByIdAndDelete({_id : e._id}));

                usuarioLogado.seguindo--;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioLogado._id}, usuarioLogado);
                usuarioASerSeguido.seguidores--;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioASerSeguido._id}, usuarioASerSeguido);

                return res.status(200).json({msg : 'Deixou de seguir o usuário com sucesso'});
            }else{
                // Sinal que eu não sigo esse usuário
                const seguidor = {
                    usuarioId : usuarioLogado._id,
                    usuarioSeguidoId : usuarioASerSeguido._id
                };
                await seguidorModel.create(seguidor);

                // Adicionar um seguidor no usuário logado
                usuarioLogado.seguindo++;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioLogado._id}, usuarioLogado);
                
                // Adicionar um seguidor no usuário seguido
                usuarioASerSeguido.seguidores++;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioASerSeguido._id}, usuarioASerSeguido);
            
                return res.status(200).json({msg : 'Usuário seguido com sucesso'});
            }
        }

        return res.status(405).json({erro : 'Método informado não existe'});
    }catch (e) {
        console.log(e);
        return res.status(500).json({erro : 'Não foi possível seguir/desseguir'});
    }
}

export default validarTokenJWT(conectarMongoDB(endpointSeguir));