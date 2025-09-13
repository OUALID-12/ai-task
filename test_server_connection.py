import requests
import time

def test_server_connection():
    print('🔍 Test de connexion au serveur...')

    for i in range(10):
        try:
            r = requests.get('http://127.0.0.1:8002/health', timeout=5)
            if r.status_code == 200:
                print('✅ Serveur accessible!')
                return True
        except:
            pass

        print(f'⏳ Tentative {i+1}/10...')
        time.sleep(2)

    print('❌ Serveur non accessible après 10 tentatives')
    return False

if __name__ == '__main__':
    test_server_connection()
