import {
  createAppointmentService,
  getAppointmentByIdService,
  getAppointmentsByPatientService,
  getAppointmentsByDoctorService,
  updateAppointmentStatusService,
  cancelAppointmentService,
  updatePaymentService,
  deleteAppointmentService
} from "../services/appointmentService.js";



export const createAppointment = async (req, res) => {

  try {

    const data = {
      ...req.body,
      patientId: req.user.id
    };

    const appointment = await createAppointmentService(data);

    res.status(201).json({
      message: "Appointment created successfully",
      appointment
    });

  } catch (error) {

    res.status(400).json({ error: error.message });

  }
};



export const getAppointmentById = async (req, res) => {

  try {

    const appointment = await getAppointmentByIdService(req.params.id);

    res.json(appointment);

  } catch (error) {

    res.status(400).json({ error: error.message });

  }
};



export const getMyAppointments = async (req, res) => {

  try {

    const appointments = await getAppointmentsByPatientService(req.user.id);

    res.json(appointments);

  } catch (error) {

    res.status(400).json({ error: error.message });

  }
};



export const getDoctorAppointments = async (req, res) => {

  try {

    const appointments = await getAppointmentsByDoctorService(req.user.id);

    res.json(appointments);

  } catch (error) {

    res.status(400).json({ error: error.message });

  }
};



export const updateAppointmentStatus = async (req, res) => {

  try {

    const appointment = await updateAppointmentStatusService(
      req.params.id,
      req.body.status
    );

    res.json(appointment);

  } catch (error) {

    res.status(400).json({ error: error.message });

  }
};



export const cancelAppointment = async (req, res) => {

  try {

    const appointment = await cancelAppointmentService(
      req.params.id,
      req.body
    );

    res.json({
      message: "Appointment cancelled",
      appointment
    });

  } catch (error) {

    res.status(400).json({ error: error.message });

  }
};



export const updatePayment = async (req, res) => {

  try {

    const { paidAmount } = req.body;

    if (!paidAmount) {
      return res.status(400).json({
        error: "paidAmount is required"
      });
    }

    const appointment = await updatePaymentService(
      req.params.id,
      paidAmount
    );

    res.json({
      message: "Payment updated",
      appointment
    });

  } catch (error) {

    res.status(400).json({ error: error.message });

  }
};


export const deleteAppointment = async (req, res) => {

  try {

    await deleteAppointmentService(req.params.id);

    res.json({
      message: "Appointment deleted"
    });

  } catch (error) {

    res.status(400).json({ error: error.message });

  }
};