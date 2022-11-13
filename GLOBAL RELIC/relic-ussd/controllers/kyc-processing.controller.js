const KycProcessing = require('../models/kyc-processing.model');


// Create and Save a new KycProcessing
exports.create = async (req, res) => {
    // Validate request
    if(!req.body) {
        return res.status(400).send({
            message: "KycProcessing content can not be empty"
        });
    }


    let { user_id, document_type, job_type, job_status, images, id_number } = req.body

    // Create a KycProcessing
    try {
        const document = await KycProcessing.create({
            user: user_id,
            documentType: document_type,
            job_type,
        })


    }
    catch (err) {
        return res.status(500).send({
            message: err.message || "Some error occurred while creating the KycProcessing."
        });
    }

}