using Microsoft.EntityFrameworkCore;
using ProjectPortal.Api.Models;

namespace ProjectPortal.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext>options)
        :base(options)
{
}


//Databse tables
public DbSet<Project> Projects{get;set;}
public DbSet<Customer> Customers{get;set;}
public DbSet<Employee> Employees{get;set;}
public DbSet<ProjectStatus> ProjectStatuses{get;set;}
public DbSet<ClientContact> ClientContacts { get; set; }
public DbSet<ProjectTask> ProjectTasks { get; set; }
public DbSet<ProjectSubTask> ProjectSubTasks { get; set; }
public DbSet<TaskEmployee> TaskEmployees { get; set; }
public DbSet<ProjectWorkStream> ProjectWorkStreams { get; set; }
public DbSet<WorkStreamPhase> WorkStreamPhases { get; set; }
public DbSet<PhaseEffort> PhaseEfforts { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Project>()
            .HasIndex(p => p.Code)
            .IsUnique();

        modelBuilder.Entity<Project>()
            .Property(p => p.Code)
            .HasMaxLength(50);

        modelBuilder.Entity<Project>()
            .Property(p => p.Name)
            .HasMaxLength(200);

        modelBuilder.Entity<Project>()
            .Property(p => p.EstimatedHours)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Project>()
            .Property(p => p.ActualHours)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Customer>()
            .Property(c => c.CustomerName)
            .HasMaxLength(150);

        modelBuilder.Entity<Employee>()
            .Property(e => e.EmployeeName)
            .HasMaxLength(150);

        modelBuilder.Entity<ProjectStatus>()
            .Property(s => s.StatusName)
            .HasMaxLength(50);

        //Project Customer Relationship

        modelBuilder.Entity<Project>()
            .HasOne(p=>p.CustomerDetails)
            .WithMany()
            .HasForeignKey(p=>p.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        //Project ->Onshore manager Relationship
        modelBuilder.Entity<Project>()
            .HasOne(p=>p.OnshoreManagerDetails)
            .WithMany()
            .HasForeignKey(p=>p.OnshoreManagerId)
            .OnDelete(DeleteBehavior.Restrict);

        //project -> offshore manager realtionship
        modelBuilder.Entity<Project>()
            .HasOne(p=>p.OffshoreManagerDetails)
            .WithMany()
            .HasForeignKey(p=>p.OffshoreManagerId)
            .OnDelete(DeleteBehavior.Restrict);

        //Project-> Status  Relationship

        modelBuilder.Entity<Project>()
            .HasOne(p=>p.StatusDetails)
            .WithMany()
            .HasForeignKey(p=>p.StatusId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ClientContact>()
            .HasOne(c => c.Customer)
            .WithMany(c => c.Contacts)
            .HasForeignKey(c => c.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ClientContact>()
            .Property(c => c.ContactName)
            .HasMaxLength(150);

        modelBuilder.Entity<ClientContact>()
            .Property(c => c.ContactEmail)
            .HasMaxLength(200);

        modelBuilder.Entity<ClientContact>()
            .Property(c => c.ContactType)
            .HasMaxLength(50);

        modelBuilder.Entity<ProjectTask>()
            .HasKey(t => t.TaskId);

        modelBuilder.Entity<ProjectTask>()
            .HasOne(t => t.Project)
            .WithMany(p => p.Tasks)
            .HasForeignKey(t => t.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProjectTask>()
            .Property(t => t.InitialPlanHours)
            .HasPrecision(18, 2);

        modelBuilder.Entity<ProjectTask>()
            .Property(t => t.RevisedPlanHours)
            .HasPrecision(18, 2);

        modelBuilder.Entity<ProjectTask>()
            .Property(t => t.TaskName)
            .HasMaxLength(200);

        modelBuilder.Entity<ProjectSubTask>()
            .HasKey(s => s.SubTaskId);

        modelBuilder.Entity<ProjectSubTask>()
            .HasOne(s => s.Task)
            .WithMany(t => t.SubTasks)
            .HasForeignKey(s => s.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProjectSubTask>()
            .Property(s => s.SubTaskName)
            .HasMaxLength(200);

        modelBuilder.Entity<TaskEmployee>()
            .HasKey(te => new { te.TaskId, te.EmployeeId });

        modelBuilder.Entity<TaskEmployee>()
            .HasOne(te => te.Task)
            .WithMany(t => t.AssignedEmployees)
            .HasForeignKey(te => te.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TaskEmployee>()
            .HasOne(te => te.Employee)
            .WithMany()
            .HasForeignKey(te => te.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ProjectWorkStream>()
            .HasKey(w => w.WorkStreamId);

        modelBuilder.Entity<ProjectWorkStream>()
            .HasOne(w => w.Project)
            .WithMany(p => p.WorkStreams)
            .HasForeignKey(w => w.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProjectWorkStream>()
            .Property(w => w.WorkStreamName)
            .HasMaxLength(150);

        modelBuilder.Entity<WorkStreamPhase>()
            .HasKey(p => p.PhaseId);

        modelBuilder.Entity<WorkStreamPhase>()
            .HasOne(p => p.WorkStream)
            .WithMany(w => w.Phases)
            .HasForeignKey(p => p.WorkStreamId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<WorkStreamPhase>()
            .HasOne(p => p.OnshoreManager)
            .WithMany()
            .HasForeignKey(p => p.OnshoreManagerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<WorkStreamPhase>()
            .HasOne(p => p.OffshoreManager)
            .WithMany()
            .HasForeignKey(p => p.OffshoreManagerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<WorkStreamPhase>()
            .Property(p => p.PhaseName)
            .HasMaxLength(150);

        modelBuilder.Entity<PhaseEffort>()
            .HasOne(e => e.Phase)
            .WithMany(p => p.Efforts)
            .HasForeignKey(e => e.PhaseId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PhaseEffort>()
            .Property(e => e.ReleaseName)
            .HasMaxLength(150);

        modelBuilder.Entity<PhaseEffort>()
            .Property(e => e.EstimatedHours)
            .HasPrecision(18, 2);

    }
}
