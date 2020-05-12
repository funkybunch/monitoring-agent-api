#!/bin/bash
df -h | awk '{print $1, $2, $3, $4, $5}'