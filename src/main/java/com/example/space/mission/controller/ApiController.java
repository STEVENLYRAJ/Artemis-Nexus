package com.example.space.mission.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@CrossOrigin(origins = "*") // Allow Python frontend / local HTML to query API
@RestController
@RequestMapping("/api")
public class ApiController {

    @GetMapping("/missions")
    public List<Map<String, Object>> getMissions() {
        List<Map<String, Object>> missions = new ArrayList<>();
        missions.add(createMission(1, "Perseverance", "NASA", "Rover", "Active", "2020-07-30", "Mars", 1468));
        missions.add(createMission(2, "JWST", "NASA/ESA", "Space Telescope", "Active", "2021-12-25", "L2 Point", null));
        missions.add(createMission(3, "Artemis III", "NASA", "Crewed Lunar", "Planned", "2026-09-01", "Moon", null));
        missions.add(createMission(4, "Chandrayaan-3", "ISRO", "Lunar Lander", "Complete", "2023-07-14", "Moon", null));
        missions.add(createMission(5, "BepiColombo", "ESA/JAXA", "Orbiter", "En Route", "2018-10-20", "Mercury", null));
        return missions;
    }

    @GetMapping("/rovers")
    public List<Map<String, Object>> getRovers() {
        List<Map<String, Object>> rovers = new ArrayList<>();
        rovers.add(createRover("Perseverance", "Active", 1468, 18.44, 77.45, 84, -63));
        rovers.add(createRover("Curiosity", "Active", 4160, -4.59, 137.44, 71, -55));
        rovers.add(createRover("Opportunity", "Offline", 5111, -1.95, 354.47, 0, null));
        return rovers;
    }

    @GetMapping("/discoveries")
    public List<Map<String, Object>> getDiscoveries() {
        List<Map<String, Object>> disc = new ArrayList<>();
        disc.add(createDiscovery(1, "Perseverance", "Organic molecules in Jezero", "2026-04-14", "Biosignature", "HIGH"));
        disc.add(createDiscovery(2, "JWST", "Carbon in TRAPPIST-1e atmosphere", "2026-03-22", "Exoatmosphere", "HIGH"));
        disc.add(createDiscovery(3, "Curiosity", "Sulfur crystal deposits", "2026-02-10", "Mineralogy", "MEDIUM"));
        return disc;
    }

    private Map<String, Object> createMission(int id, String name, String agency, String type, String status, String launch, String dest, Integer sol) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", id); m.put("name", name); m.put("agency", agency); m.put("type", type);
        m.put("status", status); m.put("launch", launch); m.put("destination", dest); m.put("sol", sol);
        return m;
    }

    private Map<String, Object> createRover(String name, String status, int sol, double lat, double lon, int bat, Integer temp) {
        Map<String, Object> m = new HashMap<>();
        m.put("name", name); m.put("status", status); m.put("sol", sol); m.put("lat", lat);
        m.put("lon", lon); m.put("battery", bat); m.put("temp", temp);
        return m;
    }

    private Map<String, Object> createDiscovery(int id, String mission, String title, String date, String type, String priority) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", id); m.put("mission", mission); m.put("title", title);
        m.put("date", date); m.put("type", type); m.put("priority", priority);
        return m;
    }
}