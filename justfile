set shell := ["bash", "-uec"]

default:
    @just --list

fmt:
    just --unstable --fmt
