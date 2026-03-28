package com.example.natural_beauty;

import org.springframework.boot.SpringApplication;

public class TestNaturalBeautyApplication {

    public static void main(String[] args) {
        SpringApplication.from(NaturalBeautyApplication::main).with(TestcontainersConfiguration.class).run(args);
    }

}
