package com.example.space.mission.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class RouteController {

    @GetMapping({"/", "/index", "/index.html"})
    public String index() { return "index"; }

    @GetMapping({"/asteroids", "/asteroids.html"})
    public String asteroids() { return "asteroids"; }

    @GetMapping({"/blackholes", "/Blackhole.html"})
    public String blackholes() { return "Blackhole"; }

    @GetMapping({"/discoveries", "/discoveries.html"})
    public String discoveries() { return "discoveries"; }

    @GetMapping({"/exoplanets", "/exoplanets.html"})
    public String exoplanets() { return "exoplanets"; }

    @GetMapping({"/mars", "/Mars.html"})
    public String mars() { return "Mars"; }

    @GetMapping({"/mission", "/mission.html"})
    public String mission() { return "mission"; }

    @GetMapping({"/solarbodies", "/solarsystembodies.html"})
    public String solarbodies() { return "solarsystembodies"; }

    @GetMapping({"/spacecraft", "/spacecraft.html"})
    public String spacecraft() { return "spacecraft"; }

    @GetMapping({"/spaceprobes", "/spaceprobes.html"})
    public String spaceprobes() { return "spaceprobes"; }

    @GetMapping({"/telescope", "/telescope.html"})
    public String telescope() { return "telescope"; }

    @GetMapping({"/upcomingmissions", "/upcomingmissions.html"})
    public String upcomingmissions() { return "upcomingmissions"; }
}
