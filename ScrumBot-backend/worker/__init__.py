import os
import redis
from rq import Worker, Queue
import multiprocessing

multiprocessing.set_start_method('spawn', force=True)


listen = ['default']
redis_url = os.getenv('REDIS_URL', 'redis://localhost:6380')

conn = redis.from_url(redis_url)

if __name__ == '__main__':
    queues = [Queue(name, connection=conn) for name in listen]
    worker = Worker(queues, connection=conn)
    worker.work()

