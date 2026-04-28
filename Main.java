import java.io.BufferedReader;
import java.io.InputStreamReader;

public class Main {
    public static void main(String[] args) {
        System.out.println("=====================================================");
        System.out.println("🚀 NEXUS SPACE MISSION TRACKER (Java + Python Hybrid)");
        System.out.println("=====================================================");
        System.out.println("[JAVA LOGIC] Initializing hybrid microservice architecture...");
        System.out.println("[JAVA LOGIC] Establishing secure pathways for API data processing...");
        
        // Java logic demonstrating task delegation
        launchPythonBackend();
    }

    private static void launchPythonBackend() {
        System.out.println("[JAVA LOGIC] Delegating backend routing and API aggregation to Python (app.py)!");
        try {
            ProcessBuilder pb = new ProcessBuilder("python", "app.py");
            pb.redirectErrorStream(true);
            Process process = pb.start();
            
            System.out.println("[JAVA LOGIC] Success! Python Flask server process started.");
            System.out.println("-----------------------------------------------------");
            System.out.println("👉 Please open http://127.0.0.1:5000 in your web browser 👈");
            System.out.println("-----------------------------------------------------");
            
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println("[Flask] " + line);
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("[JAVA LOGIC] Failed to start Python process. Please ensure 'python' is in your PATH.");
        }
    }
}
