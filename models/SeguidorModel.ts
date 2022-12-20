import mongoose, {Schema} from 'mongoose';

const seguidorSchema = new Schema ({
    // Quem segue
    usuarioId : {type : String, required : true},
    // Quem está sendo seguido
    usuarioSeguidoId : {type : String, required : true}
});

export const seguidorModel = (mongoose.models.seguidores ||
    mongoose.model('seguidores', seguidorSchema));