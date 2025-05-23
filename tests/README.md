# Load Testing with Locust

This document provides an overview of our load testing methodology using Locust for our e-commerce application.

## Overview

We used [Locust](https://locust.io/), a Python-based open-source load testing tool, to simulate user behavior and evaluate the performance of our application under various load conditions. The tests were conducted across different infrastructure configurations to identify optimal resource allocations.

## Test Script

Our test script (`locust-test.py`) simulates a complete e-commerce user flow:

1. **User Registration**: Creates a unique user account
2. **User Login**: Authenticates and obtains an access token
3. **Product Browsing**: Retrieves product listings and views random products
4. **Cart Management**: Adds products to cart and views cart contents
5. **Payment Processing**: Submits mock payment information
6. **Order Placement**: Completes the checkout process

Each simulated user performs these actions sequentially, mimicking real user behavior with realistic wait times between actions (1-3 seconds).

## Test Types

We conducted four types of performance tests:

### 1. Steady State Test
- **Purpose**: Evaluate system performance under normal, expected load
- **Parameters**: 40 users, 2 users/second spawn rate, 10 minutes duration
- **Command**: `locust -f locust-test.py -u 40 -r 2 --run-time 10m --host http://35.188.187.80:5000`

### 2. Stress Test
- **Purpose**: Determine system behavior under heavy load conditions
- **Parameters**: 400 users, 20 users/second spawn rate, 5 minutes duration
- **Command**: `locust -f locust-test.py -u 400 -r 20 --run-time 5m --host http://35.188.187.80:5000`

### 3. Spike Test
- **Purpose**: Observe system response to sudden, extreme surges in traffic
- **Parameters**: 1000 users, 50 users/second spawn rate, 10 minutes duration
- **Command**: `locust -f locust-test.py -u 1000 -r 50 --run-time 10m --host http://35.188.187.80:5000`

### 4. Soak Test
- **Purpose**: Evaluate system stability over an extended period
- **Parameters**: 60 users, 3 users/second spawn rate, 1 hour duration
- **Command**: `locust -f locust-test.py -u 60 -r 3 --run-time 1h --host http://35.188.187.80:5000`

## Infrastructure Configurations

We tested multiple infrastructure configurations to determine the optimal setup:

| Config | VM Machine Type | VM Disk | GKE Node Pool Machine Type | Nodes per Zone | GKE Autoscaler (min-max) | Focus Area |
|--------|----------------|---------|---------------------------|---------------|------------------------|-----------|
| A | e2-medium (2 vCPU, 4 GB) | 10 GB Standard PD | e2-standard-4 (4 vCPU, 16 GB) | 3 | 1-3 | Baseline configuration |
| B | e2-standard-4 (4 vCPU, 16 GB) | 10 GB Standard PD | e2-standard-4 | 3 | 1-3 | VM CPU & RAM improvements |
| C | e2-standard-4 | 20 GB SSD PD | e2-standard-4 | 3 | 1-3 | VM disk I/O & size optimization |
| D | e2-standard-4 | 20 GB SSD PD | n2-standard-4 (4 vCPU, 16 GB) | 3 | 1-3 | Node CPU architecture enhancements |
| E | e2-standard-4 | 20 GB SSD PD | n2-standard-4 | 5 | 3-7 | Cluster scale-out capabilities |
| F | n2-highcpu-8 (8 vCPU, 8 GB) | 20 GB SSD PD | n2-highcpu-8 (8 vCPU, 8 GB) | 3 | 1-3 | High-CPU workload optimization |

## Test Distribution

Each configuration was tested with specific test types:

- **Config A**: Steady state and spike tests
- **Config B**: Stress test
- **Config C**: Stress test
- **Config D**: Spike test
- **Config E**: All tests (steady state, spike, stress, soak)
- **Config F**: Stress test

## Test Results

The detailed test results are available in the respective configuration folders within the `tests/` directory. Each folder contains HTML reports, screenshots, and metrics captured during the testing process.

These results provide insights into:
- Response times under different load conditions
- Error rates and failure points
- System resource utilization
- Autoscaling behavior
- Performance bottlenecks

## Conclusion

TODO
