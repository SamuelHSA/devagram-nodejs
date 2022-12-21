import type { NextApiRequest, NextApiResponse } from 'next';
import type { respostaPadraoMsg } from '../../types/respostaPadraoMsg'
import { validarTokenJWT } from '../../middlewares/validarTokenJWT'
import { conectarMongoDB } from '../../middlewares/conectarMongoDB'
import { UsuarioModel } from '../../models/UsuarioModel';
import { publicacaoModel } from '../../models/publicacaoModel';
import { seguidorModel } from '../../models/SeguidorModel';
import { politicaCORS } from '../../middlewares/politicaCORS';

const feedEndpoint = async (req : NextApiRequest, res : NextApiResponse<respostaPadraoMsg | any>) => {
    try{
        if(req.method === 'GET') {
            if(req?.query?.id) {
                // Agora que tenho o id do usuário
                // Como eu válido se o usuário é válido
                const usuario = await UsuarioModel.findById(req?.query?.id);
                if(!usuario) {
                    return res.status(405).json({erro : 'Usuário não encontrado'});
                }

                // E como eu busco as publicações dele?
                const publicacoes = await publicacaoModel
                    .find({idUsuario : usuario.id})
                    .sort({data : -1});
                    
                    return res.status(200).json(publicacoes);
                }else{
                    const {userId} = req.query;
                    const usuarioLogado = await UsuarioModel.findById(userId);
                    if(!usuarioLogado) {
                        return res.status(400).json({erro : 'Usuário não encontrado'});
                    }

                    const seguidores = await seguidorModel.find({usuarioId : usuarioLogado.usuarioId});
                    const seguidoresIds = seguidores.map(s => s.usuarioSeguidoId);

                    const publicacoes = await publicacaoModel.find({
                        $or : [
                            {idUsuario : usuarioLogado._id},
                            {idUsuario : seguidoresIds}
                        ]
                    })
                    .sort({data : -1});

                    const result = [];
                    for (const publicacao of publicacoes) {
                        const usuarioDaPublicacao = await UsuarioModel.findById(publicacao.idUsuario);
                        if(usuarioDaPublicacao) {
                            const final = {...publicacao._doc, usuario : {
                                nome : usuarioDaPublicacao.nome,
                                avatar : usuarioDaPublicacao.avatar
                            }};
                            result.push(final);
                        }
                    }

                    return res.status(200).json({result});
                }
        }
        return res.status(405).json({erro : 'Método informado não é válido'});
    }catch(e){
        console.log(e);
    }
        return res.status(400).json({erro : 'Não foi possível obter o feed'});
}

export default politicaCORS(validarTokenJWT(conectarMongoDB(feedEndpoint)));