# Generated manually for adding reminder_hour

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0002_passwordresetcode"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="reminder_hour",
            field=models.IntegerField(default=11),
        ),
    ]
