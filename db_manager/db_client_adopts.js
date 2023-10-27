const { ModelAdoptClass } = require('../models/model_adopt');
const { readAnimalById, deleteAnimalByNgo } = require('./db_client_animals');
const { readRequestById } = require('./db_client_requests_adopt');
const { readNgoById } = require('./db_client_ngo_mongo');
const { 
    notificatorAcceptAdoptAdopter, 
    notificatorAcceptAdoptNgo, 
    notificatorRejectAdopt, 
    notificatorUndoAdopt
} = require('../notificators/notificator_adopt');

const {
    createAcceptanceByMistake,
    createDevolution,
    createMistreatment
} = require('../notificators/subjects_reasons');

async function acceptAdopt(ngoId, requestId) {
    try {

        var ngo = await readNgoById(ngoId);
        const request = await readRequestById(ngoId, requestId);

        if(request == null) {
            console.log("Requisição não encontrada.");
            return false;
        }

        const animal = await readAnimalById(ngoId, request.animalId);
        const adopter = request.adopter;

        const dataToInsert = new ModelAdoptClass({ animal: animal, adopter: adopter});

        await ngo.adopts.push(dataToInsert);
        await ngo.save();

        ngo = await readNgoById(ngoId);
        var length = ngo.requestsAdopts.length;

        if(length > 0) {
            var index = 0;
            while(index < length) {
                if( 
                    ngo.requestsAdopts[index] 
                    && ngo.requestsAdopts[index].animalId 
                    && ngo.requestsAdopts[index].animalId.toString() 
                    === request.animalId.toString()
                ) {
                    if(adopter.cpf !== ngo.requestsAdopts[index].adopter.cpf) {
                        await notificatorRejectAdopt(ngoId, ngo.requestsAdopts[index]);
                    }
                    ngo.requestsAdopts.splice(index, 1);
                    await ngo.save();
                    index--;
                    length--;
                }
                index++;
            }
        }

        await deleteAnimalByNgo(ngoId, request.animalId);

        const result = await ngo.save();
        await notificatorAcceptAdoptAdopter(ngoId, dataToInsert);
        await notificatorAcceptAdoptNgo(ngoId, dataToInsert);

        console.log('Documento inserido com sucesso:', result._id);
        return true;
    } catch (error) {
        console.error('Erro:', error);
        return false;
    }
}

async function undoAdopt(adoptId, ngoId, subjectNumber) {
    try {

        var ngo = await readNgoById(ngoId);

        const adopt = ngo.adopts.filter(adopt => adopt._id.toString() === adoptId);
        const animal = adopt[0].animal;

        const updatedAdopts = ngo.adopts.filter(adopt => adopt._id.toString() !== adoptId);

        ngo.animals.push(animal);

        var subjectReason;

        switch(subjectNumber) {
            case 1:
                subjectReason = createAcceptanceByMistake(animal.animalName);
                break;
            case 2:
                subjectReason = createDevolution(animal.animalName, ngo.ngoName);
                break;
            default: 
                subjectReason = createMistreatment(animal.animalName);
                break;
        }

        await notificatorUndoAdopt(ngo.ngoName, adopt[0], subjectReason);

        ngo.adopts = updatedAdopts;

        const result = await ngo.save();

        console.log('Adoção desfeita com sucesso: ', result._id);
    } catch (error) {
        console.error('Erro:', error);
    }
}

async function rejectAll(ngoId, animalId) {
    try {

        var ngo = await readNgoById(ngoId);

        const updatedRequests = ngo.requestsAdopts.filter(request => request.animalId !== animalId);

        ngo.requestsAdopts = updatedRequests;

        const result = await ngo.save();

        console.log('Lista de adoções excluída com sucesso: ', result._id);
    } catch (error) {
        console.error('Erro:', error);
    }
}

module.exports = {
    acceptAdopt,
    undoAdopt,
    rejectAll
};