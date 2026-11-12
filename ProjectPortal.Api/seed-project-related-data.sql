-- Repeatable sample data for the 20 business projects (IDs 1004-1023).
SET XACT_ABORT ON;
BEGIN TRANSACTION;

INSERT INTO ClientContacts (CustomerId, ContactName, ContactEmail, ContactType)
SELECT DISTINCT p.CustomerId,
    CASE c.CustomerName
        WHEN 'TCS' THEN 'Ananya Rao' WHEN 'Infosys' THEN 'Rohit Nair'
        WHEN 'wipro' THEN 'Priyanka Shah' WHEN 'HCLTech' THEN 'Karan Malhotra'
        WHEN 'Tech Mahindra' THEN 'Meera Iyer' WHEN 'Accenture' THEN 'Nikhil Kapoor'
        WHEN 'Cognizant' THEN 'Shreya Menon' WHEN 'Capgemini' THEN 'Aditya Sethi'
        WHEN 'IBM' THEN 'Riya Banerjee' WHEN 'Deloitte' THEN 'Vivek Bansal'
        WHEN 'LTIMindtree' THEN 'Neha Kulkarni' WHEN 'Tata Motors' THEN 'Arjun Desai'
        WHEN 'Reliance Industries' THEN 'Kavya Shah' WHEN 'Airtel' THEN 'Siddharth Jain'
        WHEN 'Mahindra' THEN 'Pooja Nair' WHEN 'Bosch' THEN 'Rahul Krishnan'
        WHEN 'SAP' THEN 'Aditi Verma' WHEN 'Oracle' THEN 'Sahil Mehta'
        WHEN 'HDFC Bank' THEN 'Isha Gupta' WHEN 'ICICI Bank' THEN 'Varun Joshi'
    END,
    'project.liaison+' + LOWER(REPLACE(c.CustomerName, ' ', '')) + '@example.com',
    'ContactPerson'
FROM Projects p JOIN Customers c ON c.CustomerId = p.CustomerId
WHERE p.Id BETWEEN 1004 AND 1023
  AND NOT EXISTS (SELECT 1 FROM ClientContacts x WHERE x.CustomerId=p.CustomerId AND x.ContactType='ContactPerson');

INSERT INTO ProjectWorkStreams (ProjectId, WorkStreamName)
SELECT p.Id, w.Name FROM Projects p
CROSS JOIN (VALUES ('Solution Delivery'),('Quality Assurance')) w(Name)
WHERE p.Id BETWEEN 1004 AND 1023
  AND NOT EXISTS (SELECT 1 FROM ProjectWorkStreams x WHERE x.ProjectId=p.Id AND x.WorkStreamName=w.Name);

INSERT INTO WorkStreamPhases (WorkStreamId,PhaseName,OnshoreManagerId,OffshoreManagerId,StartDate,EndDate,Description)
SELECT w.WorkStreamId,'Release 1',p.OnshoreManagerId,p.OffshoreManagerId,p.StartDate,p.EndDate,
  CASE w.WorkStreamName WHEN 'Solution Delivery' THEN 'Deliver the first usable release of ' + p.Name + '.'
  ELSE 'Verify workflows and prepare the release of ' + p.Name + '.' END
FROM ProjectWorkStreams w JOIN Projects p ON p.Id=w.ProjectId
WHERE p.Id BETWEEN 1004 AND 1023
  AND NOT EXISTS (SELECT 1 FROM WorkStreamPhases x WHERE x.WorkStreamId=w.WorkStreamId AND x.PhaseName='Release 1');

INSERT INTO PhaseEfforts (PhaseId,ReleaseName,EstimatedHours)
SELECT ph.PhaseId,'Release 1',CAST(p.EstimatedHours *
  CASE w.WorkStreamName WHEN 'Solution Delivery' THEN 0.70 ELSE 0.30 END AS decimal(18,2))
FROM WorkStreamPhases ph JOIN ProjectWorkStreams w ON w.WorkStreamId=ph.WorkStreamId
JOIN Projects p ON p.Id=w.ProjectId
WHERE p.Id BETWEEN 1004 AND 1023
  AND NOT EXISTS (SELECT 1 FROM PhaseEfforts x WHERE x.PhaseId=ph.PhaseId AND x.ReleaseName='Release 1');

INSERT INTO ProjectTasks (ProjectId,WorkStream,Phase,Category,TaskName,StartDate,EndDate,InitialPlanHours,TaskType,IsActive)
SELECT p.Id,t.WorkStream,'Release 1',t.Category,t.Prefix+p.Name,p.StartDate,p.EndDate,
  CAST(p.EstimatedHours*t.EffortShare AS decimal(18,2)),'Billable',1
FROM Projects p CROSS JOIN (VALUES
 ('Solution Delivery','Implementation','Build core workflows for ',0.70),
 ('Quality Assurance','Testing','Test and validate ',0.30)
) t(WorkStream,Category,Prefix,EffortShare)
WHERE p.Id BETWEEN 1004 AND 1023
  AND NOT EXISTS (SELECT 1 FROM ProjectTasks x WHERE x.ProjectId=p.Id AND x.TaskName=t.Prefix+p.Name);

INSERT INTO ProjectSubTasks (TaskId,SubTaskName)
SELECT t.TaskId,CASE t.Category WHEN 'Implementation' THEN 'Implement and review main user flows'
  ELSE 'Run acceptance tests and record defects' END
FROM ProjectTasks t WHERE t.ProjectId BETWEEN 1004 AND 1023
  AND NOT EXISTS (SELECT 1 FROM ProjectSubTasks x WHERE x.TaskId=t.TaskId);

INSERT INTO TaskEmployees (TaskId,EmployeeId,AssignedAt)
SELECT t.TaskId,CASE t.Category WHEN 'Implementation' THEN p.OnshoreManagerId ELSE p.OffshoreManagerId END,SYSUTCDATETIME()
FROM ProjectTasks t JOIN Projects p ON p.Id=t.ProjectId
WHERE p.Id BETWEEN 1004 AND 1023
  AND NOT EXISTS (SELECT 1 FROM TaskEmployees x WHERE x.TaskId=t.TaskId AND x.EmployeeId=
    CASE t.Category WHEN 'Implementation' THEN p.OnshoreManagerId ELSE p.OffshoreManagerId END);

COMMIT TRANSACTION;
