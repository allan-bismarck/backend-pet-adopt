const { ModelAdoptClass } = require('../models/model_adopt');
const { readAnimalById, deleteAnimalByUser } = require('./db_client_animals');
const { readRequestById, deleteRequestByUser } = require('./db_client_requests_adopt');
const { readUserById } = require('./db_client_user_mongo');
const { ObjectId } = require('mongodb');

async function acceptAdopt(userId, requestId) {
    try {

        var user = await readUserById(userId);
        const request = await readRequestById(userId, requestId);
        const animal = await readAnimalById(userId, request.animalId);
        const tutor = request.tutor;

        const dataToInsert = new ModelAdoptClass({ animal: animal, tutor: tutor});
        console.log(dataToInsert);

        await user.adopts.push(dataToInsert);
        await user.save();

        await deleteAnimalByUser(userId, request.animalId);

        user = await readUserById(userId);
        var length = user.requestsAdopts.length;

        if(length > 0) {
            var index = 0;
            while(index < length) {
                console.log(user.requestsAdopts[index].animalId);
                console.log(request.animalId);
                console.log('\n');
                if( 
                    user.requestsAdopts[index] 
                    && user.requestsAdopts[index].animalId 
                    && user.requestsAdopts[index].animalId.toString() 
                    === request.animalId.toString()
                ) {
                    console.log(index);
                    user.requestsAdopts.splice(index, 1);
                    await user.save();
                    index--;
                    length--;
                }
                index++;
            }
        }

        const result = await user.save();
        console.log('Documento inserido com sucesso:', result._id);
    } catch (error) {
        console.error('Erro:', error);
    }
}

module.exports = {
    acceptAdopt
};