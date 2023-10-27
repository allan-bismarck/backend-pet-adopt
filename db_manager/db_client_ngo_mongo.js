const mongoose = require('mongoose');
const { ModelNgoClass } = require('../models/model_ngo');
const { ObjectId } = require('mongodb');

mongoose.connect(process.env.MONGO_DB_URI,
 { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conexão com o MongoDB estabelecida'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

const { 
    notificatorWelcomeNgo, 
    notificatorEditNgo, 
    notificatorDeleteNgo 
} = require('../notificators/notificator_ngo');

async function saveNgo(data) {
    const dataToInsert = new ModelNgoClass(data);
    try {
        ModelNgoClass.createCollection().then((collection) => {
            console.log("Collection is created!");
        });
        const result = await dataToInsert.save();
        await notificatorWelcomeNgo(dataToInsert.ngoName, dataToInsert.email);

        console.log('Documento inserido com sucesso:', result._id);
    } catch (error) {
        console.error('Erro:', error);
    }
}

async function readNgo() {
    try {
        const data = await ModelNgoClass.find().exec();
        return data;
    } catch (error) {
        console.error('Erro:', error);
        return [];
    }
}

async function readNgoById(ngoId) {
    try {
        const ngo = await ModelNgoClass.findById(ngoId).exec();
        if(!ngo) {
            return null;
        }
        return ngo;
    } catch (error) {
        console.error('Erro:', error);
        return null;
    }
}

async function updateNgoById(ngoId, newNgoName, newEmail) {
    try {
        var ngo = await readNgoById(ngoId);
        if(ngo == null) {
            return "ONG não encontrada";
        } else {
            ngo.ngoName = newNgoName == null ? ngo.ngoName : newNgoName;
            ngo.email = newEmail == null ? ngo.email : newEmail;

            await ngo.save();
            await notificatorEditNgo(ngo.ngoName, ngo.email);

            console.log("ONG atualizada com sucesso.");
            return "ONG atualizada com sucesso.";
        }
    } catch(error) {
        console.log("Erro ao atualizar a ONG", error);
        return "Erro ao atualizar a ONG";
    }
}

async function deleteNgoById(ngoId) {
    try {
        var ngoObjId = new ObjectId(ngoId);

        var ngo = await readNgoById(ngoId);

        const result = await ModelNgoClass.deleteOne(ngoObjId);
        if(!result) {
            throw new Error('Documento não encontrado.');
        }

        if(ngo) {
            await notificatorDeleteNgo(ngo.ngoName, ngo.email);
        }

        console.log("Documento deletado com sucesso:", result);
        if(result.deletedCount > 0) {
            return true;
        } else {
            return false;
        }   
    } catch (error) {
        console.error('Erro ao deletar o documento:', error);
        return false;
    }
}

module.exports = {
    saveNgo,
    readNgo,
    readNgoById,
    updateNgoById,
    deleteNgoById
};