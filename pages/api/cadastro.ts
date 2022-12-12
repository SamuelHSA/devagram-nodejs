import type { NextApiRequest, NextApiResponse, NextApiHandler} from 'next';
import type { respostaPadraoMsg } from '../../types/respostaPadraoMsg';
import type { cadastroRequisicao } from '../../types/cadastroRequisicao';
import { UsuarioModel } from '../../models/UsuarioModel';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB'


import md5 from 'md5';

const endpointCadastro = 
    async (req : NextApiRequest, res : NextApiResponse<respostaPadraoMsg>) => {

    if(req.method === 'POST') {
        const usuario = req.body as cadastroRequisicao;

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

        // Salvar no Banco de dados
        const usuarioASerSalvo = {
            nome : usuario.nome,
            email : usuario.email,
            senha : usuario.senha
        }
        await UsuarioModel.create(usuarioASerSalvo);
        return res.status(200).json({msg : 'Usuario criado com sucesso'});
    }
    return res.status(405).json({erro: 'Método informado não é válido'});
}

export default conectarMongoDB(endpointCadastro);