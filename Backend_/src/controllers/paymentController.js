import {
  createPaymentService,
  getPaymentByIdService,
  getPaymentsByPatientService,
  updatePaymentStatusService,
  deletePaymentService
} from "../services/paymentService.js";


export const createPayment = async (req, res) => {

  try {

    const data = {
      ...req.body,
      patientId: req.user.id
    };

    const payment = await createPaymentService(data);

    res.status(201).json({
      message: "Payment created",
      payment
    });

  } catch (error) {

    res.status(400).json({ error: error.message });

  }
};



export const getPaymentById = async (req, res) => {

  try {

    const payment = await getPaymentByIdService(req.params.id);

    res.json(payment);

  } catch (error) {

    res.status(400).json({ error: error.message });

  }
};



export const getMyPayments = async (req, res) => {

  try {

    const payments = await getPaymentsByPatientService(req.user.id);

    res.json(payments);

  } catch (error) {

    res.status(400).json({ error: error.message });

  }
};



export const updatePaymentStatus = async (req, res) => {

  try {

    const payment = await updatePaymentStatusService(
      req.params.id,
      req.body.status
    );

    res.json({
      message: "Payment status updated",
      payment
    });

  } catch (error) {

    res.status(400).json({ error: error.message });

  }
};



export const deletePayment = async (req, res) => {

  try {

    await deletePaymentService(req.params.id);

    res.json({
      message: "Payment deleted"
    });

  } catch (error) {

    res.status(400).json({ error: error.message });

  }
};