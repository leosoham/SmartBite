const { getDb } = require('../db');

const getAllEmployees = async (req, res) => {
    try {
        const db = getDb();
        const employees = await db.collection('employees').find().toArray();
        res.json(employees);
    } catch (err) {
        console.error('Error fetching employees:', err);
        res.status(500).json({ 'message': 'Server error fetching employees' });
    }
}

const createNewEmployee = async (req, res) => {
    const { firstname, lastname } = req.body;

    if (!firstname || !lastname) {
        return res.status(400).json({ 'message': 'First and last names are required.' });
    }

    try {
        const db = getDb();
        
        // Get the highest ID to increment
        const highestEmployee = await db.collection('employees').find().sort({ id: -1 }).limit(1).toArray();
        const newId = highestEmployee.length > 0 ? highestEmployee[0].id + 1 : 1;
        
        const newEmployee = {
            id: newId,
            firstname,
            lastname
        };
        
        await db.collection('employees').insertOne(newEmployee);
        const employees = await db.collection('employees').find().toArray();
        res.status(201).json(employees);
    } catch (err) {
        console.error('Error creating employee:', err);
        res.status(500).json({ 'message': 'Server error creating employee' });
    }
}

const updateEmployee = async (req, res) => {
    const { id, firstname, lastname } = req.body;
    const employeeId = parseInt(id);
    
    try {
        const db = getDb();
        const employee = await db.collection('employees').findOne({ id: employeeId });
        
        if (!employee) {
            return res.status(400).json({ "message": `Employee ID ${id} not found` });
        }
        
        const updateFields = {};
        if (firstname) updateFields.firstname = firstname;
        if (lastname) updateFields.lastname = lastname;
        
        await db.collection('employees').updateOne(
            { id: employeeId },
            { $set: updateFields }
        );
        
        const employees = await db.collection('employees').find().sort({ id: 1 }).toArray();
        res.json(employees);
    } catch (err) {
        console.error('Error updating employee:', err);
        res.status(500).json({ 'message': 'Server error updating employee' });
    }
}

const deleteEmployee = async (req, res) => {
    const employeeId = parseInt(req.body.id);
    
    try {
        const db = getDb();
        const employee = await db.collection('employees').findOne({ id: employeeId });
        
        if (!employee) {
            return res.status(400).json({ "message": `Employee ID ${req.body.id} not found` });
        }
        
        await db.collection('employees').deleteOne({ id: employeeId });
        const employees = await db.collection('employees').find().toArray();
        res.json(employees);
    } catch (err) {
        console.error('Error deleting employee:', err);
        res.status(500).json({ 'message': 'Server error deleting employee' });
    }
}

const getEmployee = async (req, res) => {
    try {
        const db = getDb();
        const employee = await db.collection('employees').findOne({ id: parseInt(req.params.id) });
        if (!employee) {
            return res.status(400).json({ "message": `Employee ID ${req.params.id} not found` });
        }
        res.json(employee);
    } catch (err) {
        console.error('Error fetching employee:', err);
        res.status(500).json({ 'message': 'Server error fetching employee' });
    }
}

module.exports = {
    getAllEmployees,
    createNewEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployee
}