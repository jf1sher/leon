#!/usr/bin/env python
# -*- coding:utf-8 -*-
import yeelight
import utils

def lights_on(params):
    try:
        bulb = yeelight.Bulb("192.168.1.124")  # Replace with the IP address of your Yeelight bulb

        # Turn on the bulb
        bulb.turn_on()

        return utils.output('end', 'success_on')
    except Exception as e:
        return utils.output('end', 'failure')

