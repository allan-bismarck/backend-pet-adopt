const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const { 
    saveRequestAdopt,
    readRequestsAdopt,
    deleteRequestByUser
 } = require('../db_manager/db_client_requests_adopt');

const tutor = {
    urlImageTutor: "",
    tutorName: "Nome do tutor",
    cpf: "Cpf do tutor",
    rg: "RG do tutor",
    age: "idade do tutor",
    road: "rua do endereço",
    numberHouse: "numero da casa",
    neighborhood: "bairro",
    city: "Cidade",
    state: "Estado",
    telephone: "telephone",
    email: "email"
}

router.post('/create-request', async (req, res) => {

    // var tutor;
    var ngoId;
    var animalId;

    if(req.body) {
        // tutor = req.body.tutor;
        ngoId = req.body.ngoId;
        animalId = req.body.animalId;
        console.log(ngoId);
        console.log(animalId);
    }

    try {
        await saveRequestAdopt(tutor, animalId, ngoId);
        res.status(200).json({ message: 'Requisição de adoção realizada com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao realizar requisição de adoção.' });
    }
});

router.get('/all-requests', async (req, res) => {
    var ngoId;

    if (req.body) {
        ngoId = req.body.ngoId;
        console.log(ngoId);
    }

    try {
        const data = await readRequestsAdopt(ngoId);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao ler requisições de adoção.' });
    }
});

router.delete('/delete-request', async (req, res) => {
    var ngoId;
    var requestId;

    if(req.body) {
        ngoId = req.body.ngoId;
        requestId = req.body.requestId;
    }

    if (!mongoose.Types.ObjectId.isValid(ngoId) || !mongoose.Types.ObjectId.isValid(requestId)) {
        return res.status(400).json({ error: 'ID da ONG ou da requisição inválido.' });
    }

    try {
        var result = await deleteRequestByUser(ngoId, requestId);
        res.json({ message: result });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar requisição.' });
    }
});

module.exports = router;