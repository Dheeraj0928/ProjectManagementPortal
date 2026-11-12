
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectPortal.Api.Migrations
{
    public partial class AddNormalizedTables : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Add new nullable foreign key columns
            migrationBuilder.AddColumn<int>(
                name: "CustomerId",
                table: "Projects",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OffshoreManagerId",
                table: "Projects",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OnshoreManagerId",
                table: "Projects",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StatusId",
                table: "Projects",
                type: "int",
                nullable: true);

            // 2. Create Customers table
            migrationBuilder.CreateTable(
                name: "Customers",
                columns: table => new
                {
                    CustomerId = table.Column<int>(
                        type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),

                    CustomerName = table.Column<string>(
                        type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customers", x => x.CustomerId);
                });

            // 3. Create Employees table
            migrationBuilder.CreateTable(
                name: "Employees",
                columns: table => new
                {
                    EmployeeId = table.Column<int>(
                        type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),

                    EmployeeName = table.Column<string>(
                        type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Employees", x => x.EmployeeId);
                });

            // 4. Create ProjectStatuses table
            migrationBuilder.CreateTable(
                name: "ProjectStatuses",
                columns: table => new
                {
                    StatusId = table.Column<int>(
                        type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),

                    StatusName = table.Column<string>(
                        type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectStatuses", x => x.StatusId);
                });

            // 5. Transfer existing data and assign IDs
            migrationBuilder.Sql(@"
                INSERT INTO Customers (CustomerName)
                SELECT MIN(LTRIM(RTRIM(Customer)))
                FROM Projects
                GROUP BY LTRIM(RTRIM(Customer));

                INSERT INTO Employees (EmployeeName)
                SELECT MIN(EmployeeName)
                FROM
                (
                    SELECT LTRIM(RTRIM(OnshoreManager))
                        AS EmployeeName
                    FROM Projects

                    UNION ALL

                    SELECT LTRIM(RTRIM(OffshoreManager))
                        AS EmployeeName
                    FROM Projects
                ) AS Managers
                GROUP BY EmployeeName;

                INSERT INTO ProjectStatuses (StatusName)
                SELECT MIN(LTRIM(RTRIM(Status)))
                FROM Projects
                GROUP BY LTRIM(RTRIM(Status));

                UPDATE p
                SET p.CustomerId = c.CustomerId
                FROM Projects p
                INNER JOIN Customers c
                    ON LTRIM(RTRIM(p.Customer)) = c.CustomerName;

                UPDATE p
                SET p.OnshoreManagerId = e.EmployeeId
                FROM Projects p
                INNER JOIN Employees e
                    ON LTRIM(RTRIM(p.OnshoreManager)) = e.EmployeeName;

                UPDATE p
                SET p.OffshoreManagerId = e.EmployeeId
                FROM Projects p
                INNER JOIN Employees e
                    ON LTRIM(RTRIM(p.OffshoreManager)) = e.EmployeeName;

                UPDATE p
                SET p.StatusId = s.StatusId
                FROM Projects p
                INNER JOIN ProjectStatuses s
                    ON LTRIM(RTRIM(p.Status)) = s.StatusName;

                IF EXISTS
                (
                    SELECT 1
                    FROM Projects
                    WHERE CustomerId IS NULL
                       OR OnshoreManagerId IS NULL
                       OR OffshoreManagerId IS NULL
                       OR StatusId IS NULL
                )
                BEGIN
                    THROW 50001,
                        'Project relationship mapping incomplete.',
                        1;
                END;
            ");

            // 6. Create indexes
            migrationBuilder.CreateIndex(
                name: "IX_Projects_CustomerId",
                table: "Projects",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_OffshoreManagerId",
                table: "Projects",
                column: "OffshoreManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_OnshoreManagerId",
                table: "Projects",
                column: "OnshoreManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_StatusId",
                table: "Projects",
                column: "StatusId");

            // 7. Create foreign key relationships
            migrationBuilder.AddForeignKey(
                name: "FK_Projects_Customers_CustomerId",
                table: "Projects",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "CustomerId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Projects_Employees_OffshoreManagerId",
                table: "Projects",
                column: "OffshoreManagerId",
                principalTable: "Employees",
                principalColumn: "EmployeeId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Projects_Employees_OnshoreManagerId",
                table: "Projects",
                column: "OnshoreManagerId",
                principalTable: "Employees",
                principalColumn: "EmployeeId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Projects_ProjectStatuses_StatusId",
                table: "Projects",
                column: "StatusId",
                principalTable: "ProjectStatuses",
                principalColumn: "StatusId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Projects_Customers_CustomerId",
                table: "Projects");

            migrationBuilder.DropForeignKey(
                name: "FK_Projects_Employees_OffshoreManagerId",
                table: "Projects");

            migrationBuilder.DropForeignKey(
                name: "FK_Projects_Employees_OnshoreManagerId",
                table: "Projects");

            migrationBuilder.DropForeignKey(
                name: "FK_Projects_ProjectStatuses_StatusId",
                table: "Projects");

            migrationBuilder.DropTable(name: "Customers");
            migrationBuilder.DropTable(name: "Employees");
            migrationBuilder.DropTable(name: "ProjectStatuses");

            migrationBuilder.DropIndex(
                name: "IX_Projects_CustomerId",
                table: "Projects");

            migrationBuilder.DropIndex(
                name: "IX_Projects_OffshoreManagerId",
                table: "Projects");

            migrationBuilder.DropIndex(
                name: "IX_Projects_OnshoreManagerId",
                table: "Projects");

            migrationBuilder.DropIndex(
                name: "IX_Projects_StatusId",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "CustomerId", table: "Projects");

            migrationBuilder.DropColumn(
                name: "OffshoreManagerId", table: "Projects");

            migrationBuilder.DropColumn(
                name: "OnshoreManagerId", table: "Projects");

            migrationBuilder.DropColumn(
                name: "StatusId", table: "Projects");
        }
    }
}
