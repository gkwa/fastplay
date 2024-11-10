set shell := ["bash", "-uec"]

default:
    @just --list

fmt:
    terraform fmt -recursive .
    just --unstable --fmt
    pnpm fmt
