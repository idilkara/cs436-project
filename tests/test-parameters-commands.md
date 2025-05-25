## TEST SCRIPT:

    locust-test.py

## TEST PARAMETERS:

STEADY STATE TEST: 

    locust -f locust-test.py -u 40 -r 2 --run-time 10m --host http://35.188.187.80:5000
    

STRESS TEST:

    locust -f locust-test.py -u 400 -r 20 --run-time 5m --host http://35.188.187.80:5000


SPIKE TEST:

    locust -f locust-test.py -u 1000 -r 50 --run-time 10m --host http://35.188.187.80:5000


SOAK TEST:

    locust -f locust-test.py -u 60 -r 3 --run-time 1h --host http://35.188.187.80:5000