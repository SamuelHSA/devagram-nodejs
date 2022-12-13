import type { NextApiRequest, NextApiResponse, NextApiHandler} from 'next';
import type { respostaPadraoMsg } from '../../types/respostaPadraoMsg';
import type { cadastroRequisicao } from '../../types/cadastroRequisicao';
import { UsuarioModel } from '../../models/UsuarioModel';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB'
import md5 from 'md5';
import { upload, uploadImagemCosmic} from '../../services/uploadImagemCosmic';
import nc from 'next-connect';

const handler = nc()
    .use(upload.single('file'))
    .post(async (req : NextApiRequest, res : NextApiResponse<respostaPadraoMsg>) => {
        try{
            const usuario = req.body as cadastroRequisicao;
                console.log('usuario', usuario)
        if(!usuario.nome || usuario.nome.length < 2) {
            return res.status(400).json({erro : 'Nome inválido'});
        }

        if(!usuario.email || usuario.email.length < 5
            || !usuario.email.includes('@')
            || !usuario.email.includes('.')) {
            return res.status(400).json({erro : 'Email inválido'});
        }

        if(!usuario.senha || usuario.senha.length < 4) {
            return res.status(400).json({erro : 'Senha inválida'});
        }
    
        // Validação se já existe usuário com o mesmo email
        const usuarioComMesmoEmail = await UsuarioModel.find({email : usuario.email});
        if (usuarioComMesmoEmail && usuarioComMesmoEmail.length > 0){
            return res.status(400).json({erro : 'Já existe uma conta com o email informado'}); 
        }

        // Enviar a imagem do multer para o cosmic
        const image = await uploadImagemCosmic(req);

        // Salvar no Banco de dados
        const usuarioASerSalvo = {
            nome : usuario.nome,
            email : usuario.email,
            senha : md5(usuario.senha),
            avatar : image?.media?.url
        }
            await UsuarioModel.create(usuarioASerSalvo);
            return res.status(200).json({msg : 'Usuario criado com sucesso'});
        }catch(e){
            console.log(e);
            return res.status(500).json({erro : 'Erro ao cadastrar usuario'});

        }
});
    

export const config = {
    api: {
        bodyParser : false
    }
}

export default conectarMongoDB(handler)