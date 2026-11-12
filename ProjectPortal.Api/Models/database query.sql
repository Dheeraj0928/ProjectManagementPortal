-- SELECT
--     p.Id,
--     p.Name,
--     c.CustomerName,
--     e1.EmployeeName AS OnshoreManager,
--     e2.EmployeeName AS OffshoreManager,
--     s.StatusName
-- FROM Projects p
-- JOIN Customers c
--     ON p.CustomerId = c.CustomerId
-- JOIN Employees e1
--     ON p.OnshoreManagerId = e1.EmployeeId
-- JOIN Employees e2
--     ON p.OffshoreManagerId = e2.EmployeeId
-- JOIN ProjectStatuses s
--     ON p.StatusId = s.StatusId;

-- SELECT * from Employees p
-- JOIN Customers c 
-- on p.EmployeeId= c.CustomerId

SELECT * from Employees;
SELECT * from Customers;
SELECT * from ProjectStatuses;
SELECT * from Projects;

