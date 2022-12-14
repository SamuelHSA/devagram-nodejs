import type { NextApiResponse } from 'next';
import type { respostaPadraoMsg } from '../../types/respostaPadraoMsg';
import nc from 'next-connect';
import { upload, uploadImagemCosmic } from '../../services/uploadImagemCosmic';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { publicacaoModel } from '../../models/publicacaoModel';
import { UsuarioModel } from '../../models/UsuarioModel';
import { politicaCORS } from '../../middlewares/politicaCORS';

const handler = nc ()
    .use(upload.single('file'))
    .post(async (req : any, res : NextApiResponse<respostaPadraoMsg>) => {
        try{
            const {userId} = req.query;
            const usuario = await UsuarioModel.findById(userId);
            if(!usuario){
                return res.status(400).json({erro : 'Usuario não encontrado'});
            }

            if(!req || !req.body) {
                return res.status(400).json({erro : 'Parâmetros de entrada não informados'});
            }
            const {descricao} = req?.body;

            if(!descricao || descricao.length < 2) {
                return res.status(400).json({erro : 'Descrição não é válida'});
            }
    
            if(!req.file || !req.file.originalname) {
                return res.status(400).json({erro : 'A imagem é obrigatória'});
            }

            const image = await uploadImagemCosmic(req);
            const publicacao = {
                idUsuario : usuario._id,
                descricao,
                foto : image.media.url,
                data : new Date()
            }

            usuario.publicacoes++;
            await UsuarioModel.findByIdAndUpdate({_id : usuario._id}, usuario);

            await publicacaoModel.create(publicacao);
            return res.status(200).json({msg : 'Publicação criada com sucesso'});
        }catch(e){
            console.log(e);
            return res.status(400).json({erro : 'Erro ao cadastrar publicação'});
        }
});

export const config = {
    api: {
        bodyParser : false
    }
}

export default politicaCORS(validarTokenJWT(conectarMongoDB(handler)));