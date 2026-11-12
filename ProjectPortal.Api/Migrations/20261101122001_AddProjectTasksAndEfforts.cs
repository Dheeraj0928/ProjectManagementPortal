using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectPortal.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectTasksAndEfforts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "StatusName",
                table: "ProjectStatuses",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Projects",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "Projects",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "EmployeeName",
                table: "Employees",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "CustomerName",
                table: "Customers",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateTable(
                name: "ClientContacts",
                columns: table => new
                {
                    ClientContactId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    ContactName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    ContactEmail = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ContactType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientContacts", x => x.ClientContactId);
                    table.ForeignKey(
                        name: "FK_ClientContacts_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "CustomerId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectTasks",
                columns: table => new
                {
                    TaskId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    WorkStream = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Phase = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TaskName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    SubTaskSummary = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RevisedStartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RevisedEndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    InitialPlanHours = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    RevisedPlanHours = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    TaskType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectTasks", x => x.TaskId);
                    table.ForeignKey(
                        name: "FK_ProjectTasks_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectWorkStreams",
                columns: table => new
                {
                    WorkStreamId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    WorkStreamName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectWorkStreams", x => x.WorkStreamId);
                    table.ForeignKey(
                        name: "FK_ProjectWorkStreams_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectSubTasks",
                columns: table => new
                {
                    SubTaskId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TaskId = table.Column<int>(type: "int", nullable: false),
                    SubTaskName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectSubTasks", x => x.SubTaskId);
                    table.ForeignKey(
                        name: "FK_ProjectSubTasks_ProjectTasks_TaskId",
                        column: x => x.TaskId,
                        principalTable: "ProjectTasks",
                        principalColumn: "TaskId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TaskEmployees",
                columns: table => new
                {
                    TaskId = table.Column<int>(type: "int", nullable: false),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskEmployees", x => new { x.TaskId, x.EmployeeId });
                    table.ForeignKey(
                        name: "FK_TaskEmployees_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TaskEmployees_ProjectTasks_TaskId",
                        column: x => x.TaskId,
                        principalTable: "ProjectTasks",
                        principalColumn: "TaskId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WorkStreamPhases",
                columns: table => new
                {
                    PhaseId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WorkStreamId = table.Column<int>(type: "int", nullable: false),
                    PhaseName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    OnshoreManagerId = table.Column<int>(type: "int", nullable: true),
                    OffshoreManagerId = table.Column<int>(type: "int", nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkStreamPhases", x => x.PhaseId);
                    table.ForeignKey(
                        name: "FK_WorkStreamPhases_Employees_OffshoreManagerId",
                        column: x => x.OffshoreManagerId,
                        principalTable: "Employees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkStreamPhases_Employees_OnshoreManagerId",
                        column: x => x.OnshoreManagerId,
                        principalTable: "Employees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkStreamPhases_ProjectWorkStreams_WorkStreamId",
                        column: x => x.WorkStreamId,
                        principalTable: "ProjectWorkStreams",
                        principalColumn: "WorkStreamId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PhaseEfforts",
                columns: table => new
                {
                    PhaseEffortId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PhaseId = table.Column<int>(type: "int", nullable: false),
                    ReleaseName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    EstimatedHours = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhaseEfforts", x => x.PhaseEffortId);
                    table.ForeignKey(
                        name: "FK_PhaseEfforts_WorkStreamPhases_PhaseId",
                        column: x => x.PhaseId,
                        principalTable: "WorkStreamPhases",
                        principalColumn: "PhaseId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Projects_Code",
                table: "Projects",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ClientContacts_CustomerId",
                table: "ClientContacts",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_PhaseEfforts_PhaseId",
                table: "PhaseEfforts",
                column: "PhaseId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectSubTasks_TaskId",
                table: "ProjectSubTasks",
                column: "TaskId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectTasks_ProjectId",
                table: "ProjectTasks",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectWorkStreams_ProjectId",
                table: "ProjectWorkStreams",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskEmployees_EmployeeId",
                table: "TaskEmployees",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkStreamPhases_OffshoreManagerId",
                table: "WorkStreamPhases",
                column: "OffshoreManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkStreamPhases_OnshoreManagerId",
                table: "WorkStreamPhases",
                column: "OnshoreManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkStreamPhases_WorkStreamId",
                table: "WorkStreamPhases",
                column: "WorkStreamId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClientContacts");

            migrationBuilder.DropTable(
                name: "PhaseEfforts");

            migrationBuilder.DropTable(
                name: "ProjectSubTasks");

            migrationBuilder.DropTable(
                name: "TaskEmployees");

            migrationBuilder.DropTable(
                name: "WorkStreamPhases");

            migrationBuilder.DropTable(
                name: "ProjectTasks");

            migrationBuilder.DropTable(
                name: "ProjectWorkStreams");

            migrationBuilder.DropIndex(
                name: "IX_Projects_Code",
                table: "Projects");

            migrationBuilder.AlterColumn<string>(
                name: "StatusName",
                table: "ProjectStatuses",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Projects",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "Projects",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "EmployeeName",
                table: "Employees",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(150)",
                oldMaxLength: 150);

            migrationBuilder.AlterColumn<string>(
                name: "CustomerName",
                table: "Customers",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(150)",
                oldMaxLength: 150);
        }
    }
}
