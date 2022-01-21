using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using TestTask.Data;
using TestTask.Models;

namespace TestTask.Controllers
{
	[Route("[controller]")]
	public class HomeController : Controller
	{
		private readonly UsersDbContext _baseContext;

		private readonly IWebHostEnvironment _env;

		public HomeController(UsersDbContext baseContext, IWebHostEnvironment env)
		{
			_baseContext = baseContext;
			_env = env;
		}

		[HttpGet]
		public IEnumerable<User> Get()
		{
			return _baseContext.Users.ToList();
		}

		[HttpPost]
		public IActionResult Post([FromBody] IEnumerable<User> data)
		{
			_baseContext.Users.UpdateRange(data);
			_baseContext.SaveChanges();
			return Ok();
		}

		[Route("[action]")]
		[HttpPost]
		public JsonResult Calculate([FromBody] IEnumerable<User> data)
		{
			//Сохранение изменений в таблице
			_baseContext.Users.UpdateRange(data);
			_baseContext.SaveChanges();

			//Рассчет  Rolling Retention X day
			float rollingRetentionXday = 0f;
			int num = data.Where((User x) => (DateTime.Parse(x.LastActivity) - DateTime.Parse(x.RegistrationDate)).TotalDays >= 7.0).Count();
			int num2 = data.Where((User x) => (DateTime.Now - DateTime.Parse(x.RegistrationDate)).TotalDays >= 7.0).Count();
			if (num2 != 0)
			{
				rollingRetentionXday = (float)num / (float)num2 * 100f;
			}

			//Рассчет времени жизни
			List<LifeTimeData> list = new List<LifeTimeData>();
			foreach (User datum in data)
			{
				double totalDays = (DateTime.Parse(datum.LastActivity) - DateTime.Parse(datum.RegistrationDate)).TotalDays;
				LifeTimeData item = new LifeTimeData
				{
					Id = datum.id,
					LifeTime = totalDays
				};
				list.Add(item);
			}

			CalculateResult data2 = new CalculateResult
			{
				RollingRetentionXday = rollingRetentionXday,
				lifeTimeData = list
			};
			return Json(data2);
		}

		[HttpDelete]
		public IActionResult Delete(string id)
		{
			IEnumerable<User> users = _baseContext.Users;
			User user = users.FirstOrDefault((User x) => x.id == id);
			if (user == null)
			{
				return NotFound();
			}
			_baseContext.Users.Remove(user);
			_baseContext.SaveChanges();
			return Ok();
		}

		[Route("[action]")]
		[HttpPost]
		public IActionResult AddUser([FromBody] User data)
		{
			data.id = Guid.NewGuid().ToString();
			_baseContext.Users.Add(data);
			_baseContext.SaveChanges();
			return Ok();
		}
	}
}
