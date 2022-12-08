import type {NextApiRequest, NextApiResponse, NextApiHandler} from 'next';
import mongoose from 'mongoose';
import type { respostaPadraoMsg } from '../types/respostaPadraoMsg';

export const conectarMongoDB = (handler : NextApiHandler) => 
    async (req : NextApiRequest, res : NextApiResponse<respostaPadraoMsg>) => {

    // Verficar se o banco já está conectado
    // Se estiver seguir para o próximo middleware
    if(mongoose.connections[0].readyState) {
        return handler(req, res);
    }

    // Já que não está conectado vamos conectar
    // Obter a variável de ambiente preenchida do env
    const {DB_CONEXAO_STRING} = process.env;

    // Se a env estiver vazia aborta o uso do sistema e avisa o programador
    if(!DB_CONEXAO_STRING) {
        return res.status(500).json({erro : 'ENV de configuração do banco não informado'});
    }

    mongoose.connection.on('connected', () => console.log('Banco de dados conectado'));
    mongoose.connection.on('error', error => console.log(`Ocorreu erro ao conectar no banco: ${error}`));
    await mongoose.connect(DB_CONEXAO_STRING);

    // Agora posso seguir para o endpoint,
    // Pois estou conectado no banco
    return handler(req, res);
}
