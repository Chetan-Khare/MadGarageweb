import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class RepairFlyway {
    public static void main(String[] args) {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            try (Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/madgarage?serverTimezone=UTC", "root", "root");
                 Statement stmt = conn.createStatement()) {
                int rows = stmt.executeUpdate("DELETE FROM flyway_schema_history WHERE success = 0");
                System.out.println("Deleted " + rows + " failed flyway migrations.");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
